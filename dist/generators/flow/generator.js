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
var os = require("os");
var prettier = require("prettier");
var utils_1 = require("../../utils");
var common_1 = require("../common");
var generator_1 = require("../typescript/generator");
function format(code, options) {
    if (options === void 0) { options = {}; }
    try {
        return prettier.format(code, __assign({}, options, { parser: 'flow' }));
    }
    catch (e) {
        console.log("There is a syntax error in generated code, unformatted code printed, error: " + JSON.stringify(e));
        return code;
    }
}
exports.format = format;
function generate(args) {
    // TODO: Maybe move this to source helper
    var inputTypesMap = args.types
        .filter(function (type) { return type.type.isInput; })
        .reduce(function (inputTypes, type) {
        var _a;
        return __assign({}, inputTypes, (_a = {}, _a["" + type.name] = type, _a));
    }, {});
    // TODO: Type this
    var typeToInputTypeAssociation = args.types
        .filter(function (type) {
        return type.type.isObject &&
            type.fields.filter(function (field) { return field.arguments.filter(function (arg) { return arg.type.isInput; }).length > 0; }).length > 0;
    })
        .reduce(function (types, type) {
        var _a;
        return __assign({}, types, (_a = {}, _a["" + type.name] = [].concat.apply([], type.fields.map(function (field) {
            return field.arguments
                .filter(function (arg) { return arg.type.isInput; })
                .map(function (arg) { return arg.type.name; });
        })), _a));
    }, {});
    var interfacesMap = common_1.createInterfacesMap(args.interfaces);
    var unionsMap = common_1.createUnionsMap(args.unions);
    return "  " + renderHeader(args) + "\n\n  " + common_1.renderEnums(args) + "\n\n  " + renderNamespaces(args, interfacesMap, unionsMap, typeToInputTypeAssociation, inputTypesMap) + "\n\n  " + renderResolvers(args) + "\n\n  ";
}
exports.generate = generate;
function renderHeader(args) {
    var modelsToImport = Object.keys(args.modelMap).map(function (k) { return args.modelMap[k]; });
    var modelsByImportPaths = common_1.groupModelsNameByImportPath(modelsToImport);
    var modelImports = Object.keys(modelsByImportPaths)
        .map(function (importPath) {
        return "import type { " + modelsByImportPaths[importPath].join(',') + " } from '" + importPath + "'";
    })
        .join(os.EOL);
    var graphQLImports = ['GraphQLResolveInfo'];
    return "/* @flow */\n// Code generated by github.com/prisma/graphqlgen, DO NOT EDIT.\n\nimport type { " + graphQLImports.join(', ') + " } from 'graphql'\n" + modelImports + "\n" + renderContext(args.context) + "\n  ";
}
function renderContext(context) {
    if (context) {
        return "import type  { " + common_1.getContextName(context) + " } from '" + context.contextPath + "'";
    }
    return "type " + common_1.getContextName(context) + " = any";
}
function renderNamespaces(args, interfacesMap, unionsMap, typeToInputTypeAssociation, inputTypesMap) {
    var objectNamespaces = args.types
        .filter(function (type) { return type.type.isObject; })
        .map(function (type) {
        return renderNamespace(type, interfacesMap, unionsMap, typeToInputTypeAssociation, inputTypesMap, args);
    })
        .join(os.EOL);
    return "    " + objectNamespaces + "\n\n    " + renderUnionNamespaces(args) + "\n  ";
}
function renderNamespace(type, interfacesMap, unionsMap, typeToInputTypeAssociation, inputTypesMap, args) {
    var typeName = utils_1.upperFirst(type.name);
    return "    // Types for " + typeName + "\n    " + (args.defaultResolversEnabled
        ? common_1.renderDefaultResolvers(type, args, typeName + "_defaultResolvers")
        : '') + "\n\n    " + renderInputTypeInterfaces(type, args.modelMap, interfacesMap, unionsMap, typeToInputTypeAssociation, inputTypesMap) + "\n\n    " + renderInputArgInterfaces(type, args.modelMap, interfacesMap, unionsMap) + "\n\n    " + renderResolverFunctionInterfaces(type, args.modelMap, interfacesMap, unionsMap, args.context) + "\n\n    " + renderResolverTypeInterface(type, args.modelMap, interfacesMap, unionsMap, args.context) + "\n\n    " + '' + "\n  ";
}
function renderUnionNamespaces(args) {
    return args.unions.map(function (type) { return renderUnionNamespace(type, args); }).join(os.EOL);
}
function renderUnionNamespace(graphQLTypeObject, args) {
    return "    export interface " + graphQLTypeObject.name + "_Resolvers {\n      __resolveType?: " + generator_1.renderTypeResolveTypeResolver(graphQLTypeObject, args) + "\n    }\n  ";
}
function renderInputTypeInterfaces(type, modelMap, interfacesMap, unionsMap, typeToInputTypeAssociation, inputTypesMap) {
    if (!typeToInputTypeAssociation[type.name]) {
        return "";
    }
    return common_1.getDistinctInputTypes(type, typeToInputTypeAssociation, inputTypesMap)
        .map(function (typeAssociation) {
        return "export interface " + utils_1.upperFirst(type.name) + "_" + utils_1.upperFirst(inputTypesMap[typeAssociation].name) + " {\n      " + inputTypesMap[typeAssociation].fields.map(function (field) {
            return common_1.printFieldLikeType(field, modelMap, interfacesMap, unionsMap);
        }) + "\n    }";
    })
        .join(os.EOL);
}
function renderInputArgInterfaces(type, modelMap, interfacesMap, unionsMap) {
    return type.fields
        .map(function (field) {
        return renderInputArgInterface(type, field, modelMap, interfacesMap, unionsMap);
    })
        .join(os.EOL);
}
function renderInputArgInterface(type, field, modelMap, interfacesMap, unionsMap) {
    if (field.arguments.length === 0) {
        return '';
    }
    return "\n  export interface " + getInputArgName(type, field) + " {\n    " + field.arguments
        .map(function (arg) {
        return common_1.printFieldLikeType(arg, modelMap, interfacesMap, unionsMap).replace(': ', ": " + getArgTypePrefix(type, arg));
    })
        .join(',' + os.EOL) + "\n  }\n  ";
}
var getArgTypePrefix = function (type, fieldArg) {
    if (fieldArg.type.isScalar ||
        // Object type includes GQL ID
        fieldArg.type.isObject ||
        fieldArg.type.isEnum)
        return '';
    return utils_1.upperFirst(type.name) + '_';
};
function renderResolverFunctionInterfaces(type, modelMap, interfacesMap, unionsMap, context) {
    return type.fields
        .map(function (field) {
        return renderResolverFunctionInterface(field, type, modelMap, interfacesMap, unionsMap, context);
    })
        .join(os.EOL);
}
function renderResolverFunctionInterface(field, type, modelMap, interfacesMap, unionsMap, context) {
    var resolverName = utils_1.upperFirst(type.name) + "_" + utils_1.upperFirst(field.name) + "_Resolver";
    var resolverDefinition = "\n  (\n    parent: " + common_1.getModelName(type.type, modelMap) + ",\n    args: " + (field.arguments.length > 0 ? getInputArgName(type, field) : '{}') + ",\n    ctx: " + common_1.getContextName(context) + ",\n    info: GraphQLResolveInfo,\n  )\n  ";
    var returnType = common_1.printFieldLikeType(field, modelMap, interfacesMap, unionsMap, {
        isReturn: true,
    });
    if (type.name === 'Subscription') {
        return "\n    export type " + resolverName + " = {|\n      subscribe: " + resolverDefinition + " => AsyncIterator<" + returnType + "> | Promise<AsyncIterator<" + returnType + ">>,\n      resolve?: " + resolverDefinition + " => " + common_1.resolverReturnType(returnType) + "\n    |}\n    ";
    }
    return "\n  export type " + resolverName + " = " + resolverDefinition + " => " + common_1.resolverReturnType(returnType) + "\n  ";
}
function renderResolverTypeInterface(type, modelMap, interfacesMap, unionsMap, context) {
    return "\n  export interface " + utils_1.upperFirst(type.name) + "_Resolvers {\n    " + type.fields
        .map(function (field) {
        return renderResolverTypeInterfaceFunction(field, type, modelMap, interfacesMap, unionsMap, context);
    })
        .join(os.EOL) + "\n  }\n  ";
}
function renderResolverTypeInterfaceFunction(field, type, modelMap, interfacesMap, unionsMap, context) {
    var resolverDefinition = "\n  (\n    parent: " + common_1.getModelName(type.type, modelMap) + ",\n    args: " + (field.arguments.length > 0 ? getInputArgName(type, field) : '{}') + ",\n    ctx: " + common_1.getContextName(context) + ",\n    info: GraphQLResolveInfo,\n  )";
    var returnType = common_1.printFieldLikeType(field, modelMap, interfacesMap, unionsMap, {
        isReturn: true,
    });
    if (type.name === 'Subscription') {
        return "\n    " + field.name + ": {|\n      subscribe: " + resolverDefinition + " => AsyncIterator<" + returnType + "> | Promise<AsyncIterator<" + returnType + ">>,\n      resolve?: " + resolverDefinition + " => " + common_1.resolverReturnType(returnType) + "\n    |}\n    ";
    }
    return "\n  " + field.name + ": " + resolverDefinition + " => " + common_1.resolverReturnType(returnType) + ",\n  ";
}
function renderResolvers(args) {
    return "\nexport interface Resolvers {\n  " + args.types
        .filter(function (type) { return type.type.isObject; })
        .map(function (type) { return type.name + ": " + utils_1.upperFirst(type.name) + "_Resolvers"; }).concat(args.interfaces.map(function (type) { return type.name + "?: " + utils_1.upperFirst(type.name) + "_Resolvers"; }), args.unions.map(function (type) { return type.name + "?: " + utils_1.upperFirst(type.name) + "_Resolvers"; })).join("," + os.EOL) + "\n}\n  ";
}
function getInputArgName(type, field) {
    return utils_1.upperFirst(type.name) + "_Args_" + utils_1.upperFirst(field.name);
}
//# sourceMappingURL=generator.js.map