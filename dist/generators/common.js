"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var os = require("os");
var source_helper_1 = require("../source-helper");
var utils_1 = require("../introspection/utils");
exports.createInterfacesMap = function (interfaces) {
    return interfaces.reduce(function (interfacesMap, inter) {
        interfacesMap[inter.name] = inter.implementors;
        return interfacesMap;
    }, {});
};
exports.createUnionsMap = function (unions) {
    return unions.reduce(function (unionsMap, union) {
        unionsMap[union.name] = union.types;
        return unionsMap;
    }, {});
};
function fieldsFromModelDefinition(modelDef) {
    // If model is of type `interface InterfaceName { ... }`
    if (modelDef.kind === 'InterfaceDefinition') {
        var interfaceDef = modelDef;
        return interfaceDef.fields;
    }
    // If model is of type `type TypeName = { ... }`
    if (modelDef.kind === 'TypeAliasDefinition' &&
        modelDef.getType() &&
        modelDef.getType().kind === 'AnonymousInterfaceAnnotation') {
        var interfaceDef = modelDef.getType();
        return interfaceDef.fields;
    }
    return [];
}
exports.fieldsFromModelDefinition = fieldsFromModelDefinition;
function renderDefaultResolvers(graphQLTypeObject, args, variableName) {
    var model = args.modelMap[graphQLTypeObject.name];
    if (model === undefined) {
        return "export const " + variableName + " = {}";
    }
    var modelDef = model.definition;
    return "export const " + variableName + " = {\n    " + fieldsFromModelDefinition(modelDef)
        .filter(function (modelField) {
        var graphQLField = graphQLTypeObject.fields.find(function (field) { return field.name === modelField.name; });
        return shouldRenderDefaultResolver(graphQLField, modelField, args);
    })
        .map(function (modelField) {
        return renderDefaultResolver(modelField.name, modelField.optional, model.definition.name);
    })
        .join(os.EOL) + "\n  }";
}
exports.renderDefaultResolvers = renderDefaultResolvers;
function renderDefaultResolver(fieldName, fieldOptional, parentTypeName) {
    var field = "parent." + fieldName;
    var fieldGetter = renderFieldGetter(field, fieldOptional);
    return fieldName + ": (parent: " + parentTypeName + ") => " + fieldGetter + ",";
}
function renderFieldGetter(fieldGetter, fieldOptional) {
    if (fieldOptional) {
        return fieldGetter + " === undefined ? null : " + fieldGetter;
    }
    return fieldGetter;
}
function getContextName(context) {
    if (!context) {
        return 'Context';
    }
    return context.interfaceName;
}
exports.getContextName = getContextName;
function getModelName(type, modelMap, emptyType) {
    if (emptyType === void 0) { emptyType = '{}'; }
    var model = modelMap[type.name];
    if (type.isEnum) {
        return type.name;
    }
    // NOTE if no model is found, return the empty type
    // It's usually assumed that every GraphQL type has a model associated
    // expect for the `Query`, `Mutation` and `Subscription` type
    if (model === undefined) {
        return emptyType;
    }
    return model.definition.name;
}
exports.getModelName = getModelName;
function isModelEnumSubsetOfGraphQLEnum(graphQLEnumValues, modelEnumValues) {
    return modelEnumValues.every(function (enumValue) {
        return graphQLEnumValues.includes(enumValue);
    });
}
function shouldRenderDefaultResolver(graphQLField, modelField, args) {
    if (graphQLField === undefined) {
        return false;
    }
    if (modelField === undefined) {
        return false;
    }
    var modelFieldType = modelField.getType();
    if (modelFieldType === undefined) {
        return false;
    }
    // If both types are enums, and model definition enum is a subset of the graphql enum
    // Then render as defaultResolver
    // eg: given GraphQLEnum = 'A' | 'B' | 'C'
    // render when FieldDefinition = ('A') | ('A' | 'B') | ('A | 'B' | 'C')
    if (graphQLField.type.isEnum &&
        utils_1.isFieldDefinitionEnumOrLiteral(modelFieldType)) {
        return isModelEnumSubsetOfGraphQLEnum(source_helper_1.getGraphQLEnumValues(graphQLField, args.enums), utils_1.getEnumValues(modelFieldType));
    }
    return !(modelField.optional && graphQLField.type.isRequired);
}
function shouldScaffoldFieldResolver(graphQLField, modelFields, args) {
    var modelField = modelFields.find(function (modelField) { return modelField.name === graphQLField.name; });
    return !shouldRenderDefaultResolver(graphQLField, modelField, args);
}
exports.shouldScaffoldFieldResolver = shouldScaffoldFieldResolver;
var nullable = function (type) {
    return type + " | null";
};
exports.kv = function (key, value, isOptional) {
    if (isOptional === void 0) { isOptional = false; }
    return "" + key + (isOptional ? '?' : '') + ": " + value;
};
var array = function (innerType, config) {
    if (config === void 0) { config = {}; }
    return config.innerUnion ? innerType + "[]" : "Array<" + innerType + ">";
};
exports.union = function (types) {
    return types.join(' | ');
};
exports.resolverReturnType = function (returnType) {
    return exports.union([returnType, "Promise<" + returnType + ">"]);
};
exports.printFieldLikeType = function (field, modelMap, interfacesMap, unionsMap, options) {
    if (options === void 0) { options = {
        isReturn: false,
    }; }
    if (field.type.isInterface || field.type.isUnion) {
        var typesMap = field.type.isInterface ? interfacesMap : unionsMap;
        var modelNames = typesMap[field.type.name].map(function (type) {
            return getModelName(type, modelMap);
        });
        var rendering = exports.union(modelNames);
        if (!field.type.isRequired) {
            rendering = nullable(rendering);
        }
        if (field.type.isArray) {
            rendering = array(rendering, { innerUnion: false });
            if (!field.type.isArrayRequired) {
                rendering = nullable(rendering);
            }
        }
        // We do not have to handle defaults becuase graphql only
        // supports defaults on field params but conversely
        // interfaces and unions are only supported on output. Therefore
        // these two features will never cross.
        // No check for isReturn option because unions and interfaces
        // cannot be used to type graphql field parameters which implies
        // this branch will always be for a return case.
        return rendering;
    }
    var name = field.type.isScalar
        ? getTypeFromGraphQLType(field.type.name)
        : field.type.isInput || field.type.isEnum
            ? field.type.name
            : getModelName(field.type, modelMap);
    /**
     * Considerable difference between types in array versus not, such as what
     * default value means, isRequired, ..., lead to forking the rendering paths.
     *
     * Regarding voidable, note how it can only show up in the k:v rendering e.g.:
     *
     *     foo?: null | string
     *
     * but not for return style e.g.:
     *
     *     undefined | null | string
     *
     * given footnote 1 below.
     *
     * 1. Return type doesn't permit void return since that would allow
     *    resolvers to e.g. forget to return anything and that be considered OK.
     */
    if (field.type.isArray) {
        var innerUnion = field.type.isRequired;
        // - Not voidable here because a void array member is not possible
        // - For arrays default value does not apply to inner value
        var valueInnerType = field.type.isRequired ? name : nullable(name);
        var isArrayNullable = !field.type.isArrayRequired &&
            (field.defaultValue === undefined || field.defaultValue === null);
        var isArrayVoidable = isArrayNullable && field.defaultValue === undefined;
        var valueType = isArrayNullable
            ? nullable(array(valueInnerType, { innerUnion: innerUnion })) // [1]
            : array(valueInnerType, { innerUnion: innerUnion });
        return options.isReturn
            ? valueType
            : exports.kv(field.name, valueType, isArrayVoidable);
    }
    else {
        var isNullable = !field.type.isRequired &&
            (field.defaultValue === undefined || field.defaultValue === null);
        var isVoidable = isNullable && field.defaultValue === undefined;
        var valueType = isNullable ? nullable(name) : name; // [1]
        return options.isReturn ? valueType : exports.kv(field.name, valueType, isVoidable);
    }
};
function getTypeFromGraphQLType(type) {
    if (type === 'Int' || type === 'Float') {
        return 'number';
    }
    if (type === 'Boolean') {
        return 'boolean';
    }
    if (type === 'String' || type === 'ID' || type === 'DateTime') {
        return 'string';
    }
    return 'string';
}
exports.getTypeFromGraphQLType = getTypeFromGraphQLType;
exports.getDistinctInputTypes = function (type, typeToInputTypeAssociation, inputTypesMap) {
    var inputTypes = [];
    var seen = {};
    var inputTypeNames = [];
    var see = function (typeName) {
        if (!seen[typeName]) {
            seen[typeName] = true;
            inputTypes.push(inputTypesMap[typeName]);
        }
    };
    typeToInputTypeAssociation[type.name].forEach(see);
    for (var _i = 0, inputTypes_1 = inputTypes; _i < inputTypes_1.length; _i++) {
        var inputType = inputTypes_1[_i];
        inputTypeNames.push(inputType.type.name);
        // Keep seeing (aka. traversing the tree) until we've seen everything.
        for (var _a = 0, _b = inputType.fields; _a < _b.length; _a++) {
            var field = _b[_a];
            if (field.type.isInput) {
                see(field.type.name);
            }
        }
    }
    return inputTypeNames;
};
function renderEnums(args) {
    return args.enums
        .map(function (enumObject) {
        return "export type " + enumObject.name + " = " + enumObject.values
            .map(function (value) { return "'" + value + "'"; })
            .join(' | ');
    })
        .join(os.EOL);
}
exports.renderEnums = renderEnums;
function isParentType(name) {
    var parentTypes = ['Query', 'Mutation', 'Subscription'];
    return parentTypes.indexOf(name) > -1;
}
exports.isParentType = isParentType;
function groupModelsNameByImportPath(models) {
    return models.reduce(function (acc, model) {
        var fileModels = acc[model.importPathRelativeToOutput] || [];
        if (!fileModels.includes(model.definition.name)) {
            fileModels.push(model.definition.name);
        }
        acc[model.importPathRelativeToOutput] = fileModels;
        return acc;
    }, {});
}
exports.groupModelsNameByImportPath = groupModelsNameByImportPath;
//# sourceMappingURL=common.js.map