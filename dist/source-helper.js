"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
/** Converts typeDefs, e.g. the raw SDL string, into our `GraphQLTypes`. */
function extractTypes(typeDefs) {
    var schema = graphql_1.buildASTSchema(graphql_1.parse(typeDefs));
    var types = extractGraphQLTypes(schema);
    var unions = extractGraphQLUnions(schema);
    var enums = extractGraphQLEnums(schema);
    var interfaces = extractGraphQLInterfaces(schema, types);
    return { types: types, enums: enums, unions: unions, interfaces: interfaces };
}
exports.extractTypes = extractTypes;
exports.GraphQLScalarTypeArray = [
    'Boolean',
    'Int',
    'Float',
    'String',
    'ID',
];
function extractTypeDefinition(schema, fromNode) {
    var typeLike = {
        isObject: false,
        isInput: false,
        isEnum: false,
        isUnion: false,
        isScalar: false,
        isInterface: false,
    };
    var node = schema.getType(fromNode.name);
    if (node instanceof graphql_1.GraphQLObjectType) {
        typeLike.isObject = true;
    }
    else if (node instanceof graphql_1.GraphQLInputObjectType) {
        typeLike.isInput = true;
    }
    else if (node instanceof graphql_1.GraphQLEnumType) {
        typeLike.isEnum = true;
    }
    else if (node instanceof graphql_1.GraphQLUnionType) {
        typeLike.isUnion = true;
    }
    else if (node instanceof graphql_1.GraphQLScalarType) {
        typeLike.isScalar = true;
    }
    else if (node instanceof graphql_1.GraphQLInterfaceType) {
        typeLike.isInterface = true;
    }
    // Handle built-in scalars
    if (exports.GraphQLScalarTypeArray.indexOf(fromNode.name) > -1) {
        typeLike.isScalar = true;
    }
    return typeLike;
}
var getFinalType = function (type, acc) {
    if (acc === void 0) { acc = {
        isArray: false,
        isArrayRequired: false,
        isRequired: false,
        type: type,
    }; }
    if (type instanceof graphql_1.GraphQLNonNull) {
        acc.isRequired = true;
    }
    if (type instanceof graphql_1.GraphQLList) {
        acc.isArray = true;
        acc.isArrayRequired = acc.isRequired;
        acc.isRequired = false;
    }
    if (type instanceof graphql_1.GraphQLNonNull || type instanceof graphql_1.GraphQLList) {
        return getFinalType(type.ofType, acc);
    }
    return __assign({}, acc, { type: type });
};
function extractTypeLike(schema, type) {
    var typeLike = {};
    var _a = getFinalType(type), isArray = _a.isArray, isArrayRequired = _a.isArrayRequired, isRequired = _a.isRequired, finalType = _a.type;
    if (isRequired) {
        typeLike.isRequired = true;
    }
    if (isArray) {
        typeLike.isArray = true;
    }
    if (isArrayRequired) {
        typeLike.isArrayRequired = true;
    }
    if (finalType instanceof graphql_1.GraphQLObjectType ||
        finalType instanceof graphql_1.GraphQLInterfaceType ||
        finalType instanceof graphql_1.GraphQLEnumType ||
        finalType instanceof graphql_1.GraphQLUnionType ||
        finalType instanceof graphql_1.GraphQLInputObjectType ||
        finalType instanceof graphql_1.GraphQLScalarType) {
        typeLike.name = finalType.name;
    }
    var typeDefinitionLike = extractTypeDefinition(schema, typeLike);
    return __assign({}, typeLike, typeDefinitionLike);
}
function extractTypeFieldsFromObjectType(schema, node) {
    var fields = [];
    Object.values(node.getFields()).forEach(function (fieldNode) {
        var fieldType = extractTypeLike(schema, fieldNode.type);
        var fieldArguments = [];
        fieldNode.args.forEach(function (arg) {
            fieldArguments.push({
                name: arg.name,
                defaultValue: arg.defaultValue,
                type: extractTypeLike(schema, arg.type),
            });
        });
        fields.push({
            name: fieldNode.name,
            type: fieldType,
            arguments: fieldArguments,
        });
    });
    return fields;
}
function extractTypeFieldsFromInputType(schema, node) {
    var fields = [];
    Object.values(node.getFields()).forEach(function (input) {
        fields.push({
            name: input.name,
            type: extractTypeLike(schema, input.type),
            defaultValue: input.defaultValue,
            arguments: [],
        });
    });
    return fields;
}
function extractGraphQLTypes(schema) {
    var types = [];
    Object.values(schema.getTypeMap()).forEach(function (node) {
        // Ignore meta types like __Schema and __TypeKind
        if (node.name.startsWith('__')) {
            return;
        }
        if (node instanceof graphql_1.GraphQLEnumType) {
            types.push({
                name: node.name,
                type: {
                    name: node.name,
                    isObject: false,
                    isInput: false,
                    isEnum: true,
                    isUnion: false,
                    isScalar: false,
                    isInterface: false,
                },
                fields: [],
                implements: null,
            });
        }
        else if (node instanceof graphql_1.GraphQLObjectType) {
            types.push({
                name: node.name,
                type: {
                    name: node.name,
                    isObject: true,
                    isInput: false,
                    isEnum: false,
                    isUnion: false,
                    isScalar: false,
                    isInterface: false,
                },
                fields: extractTypeFieldsFromObjectType(schema, node),
                implements: node
                    .getInterfaces()
                    .map(function (interfaceType) { return interfaceType.name; }),
            });
        }
        else if (node instanceof graphql_1.GraphQLInputObjectType) {
            types.push({
                name: node.name,
                type: {
                    name: node.name,
                    isObject: false,
                    isInput: true,
                    isEnum: false,
                    isUnion: false,
                    isScalar: false,
                    isInterface: false,
                },
                fields: extractTypeFieldsFromInputType(schema, node),
                implements: null,
            });
        }
    });
    return types;
}
function extractGraphQLEnums(schema) {
    var types = [];
    Object.values(schema.getTypeMap())
        .filter(function (node) {
        return node.name !== '__TypeKind' && node.name !== '__DirectiveLocation';
    })
        .forEach(function (node) {
        if (node instanceof graphql_1.GraphQLEnumType) {
            types.push({
                name: node.name,
                type: {
                    name: node.name,
                    isObject: false,
                    isInput: false,
                    isEnum: true,
                    isUnion: false,
                    isScalar: false,
                    isInterface: false,
                },
                values: node.getValues().map(function (v) { return v.name; }),
            });
        }
    });
    return types;
}
function extractGraphQLUnions(schema) {
    var types = [];
    Object.values(schema.getTypeMap()).forEach(function (node) {
        if (node instanceof graphql_1.GraphQLUnionType) {
            var unionTypes = node.getTypes().map(function (t) {
                return extractTypeLike(schema, t);
            });
            types.push({
                name: node.name,
                kind: 'union',
                type: {
                    name: node.name,
                    isObject: false,
                    isInput: false,
                    isEnum: false,
                    isUnion: true,
                    isScalar: false,
                    isInterface: false,
                },
                types: unionTypes,
            });
        }
    });
    return types;
}
function extractGraphQLInterfaces(schema, types) {
    var interfaceUsingTypes = types.filter(function (type) { return type.implements !== null; });
    return Object.values(schema.getTypeMap())
        .filter(function (node) { return node instanceof graphql_1.GraphQLInterfaceType; })
        .reduce(function (interfaces, node) {
        node = node;
        var implementorTypes = interfaceUsingTypes
            .filter(function (type) { return type.implements.includes(node.name); })
            .map(function (type) { return type.type; });
        if (implementorTypes.length) {
            interfaces.push({
                name: node.name,
                kind: 'interface',
                type: {
                    name: node.name,
                    isObject: false,
                    isInput: false,
                    isEnum: false,
                    isUnion: false,
                    isScalar: false,
                    isInterface: true,
                },
                implementors: implementorTypes,
                fields: extractTypeFieldsFromObjectType(schema, node),
            });
        }
        return interfaces;
    }, []);
}
var graphqlToTypescriptFlow = {
    String: 'string',
    Boolean: 'boolean',
    ID: 'string',
    Int: 'number',
    Float: 'number',
    DateTime: 'string',
};
function graphQLToTypecriptFlowType(type) {
    var typescriptType = graphqlToTypescriptFlow[type.name];
    if (typescriptType === undefined) {
        typescriptType = 'any';
    }
    if (type.isArray) {
        typescriptType += '[]';
    }
    if (!type.isRequired) {
        typescriptType += ' | null';
    }
    return typescriptType;
}
exports.graphQLToTypecriptFlowType = graphQLToTypecriptFlowType;
function extractGraphQLTypesWithoutRootsAndInputsAndEnums(schema) {
    return schema.types
        .filter(function (type) { return !type.type.isInput; })
        .filter(function (type) { return !type.type.isEnum; })
        .filter(function (type) { return ['Query', 'Mutation', 'Subscription'].indexOf(type.name) === -1; });
}
exports.extractGraphQLTypesWithoutRootsAndInputsAndEnums = extractGraphQLTypesWithoutRootsAndInputsAndEnums;
function getGraphQLEnumValues(enumField, graphQLEnumObjects) {
    if (!enumField.type.isEnum) {
        return [];
    }
    var graphQLEnumObject = graphQLEnumObjects.find(function (graphqlEnum) { return graphqlEnum.name === enumField.type.name; });
    if (!graphQLEnumObject) {
        return [];
    }
    return graphQLEnumObject.values;
}
exports.getGraphQLEnumValues = getGraphQLEnumValues;
//# sourceMappingURL=source-helper.js.map