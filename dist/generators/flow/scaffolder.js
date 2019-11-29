"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../../utils");
var common_1 = require("../common");
var generator_1 = require("./generator");
exports.format = generator_1.format;
function renderParentResolvers(type) {
    var upperTypeName = utils_1.upperFirst(type.name);
    var code = "/* @flow */\n  import type { " + upperTypeName + "_Resolvers } from '[TEMPLATE-INTERFACES-PATH]'\n\n  export const " + type.name + ": " + upperTypeName + "_Resolvers = {\n    " + type.fields.map(function (field) {
        if (type.name === 'Subscription') {
            return field.name + ": {\n          subscribe: (parent, args, ctx, info) => {\n            throw new Error('Resolver not implemented')\n          }\n        }";
        }
        return field.name + ": (parent, args, ctx, info) => {\n          throw new Error('Resolver not implemented')\n        }";
    }) + "\n  }\n  ";
    return {
        path: type.name + ".js",
        force: false,
        code: code,
    };
}
function renderExports(types) {
    return "  // @flow\n  // This resolver file was scaffolded by github.com/prisma/graphqlgen, DO NOT EDIT.\n  // Please do not import this file directly but copy & paste to your application code.\n\n  import type { Resolvers } from '[TEMPLATE-INTERFACES-PATH]'\n    " + types
        .filter(function (type) { return type.type.isObject; })
        .map(function (type) { return "\n      import { " + type.name + " } from './" + type.name + "'\n    "; })
        .join(';') + "\n\n    export const resolvers: Resolvers = {\n      " + types
        .filter(function (type) { return type.type.isObject; })
        .map(function (type) { return "" + type.name; })
        .join(',') + "\n    }";
}
function renderPolyResolvers(type) {
    var upperTypeName = utils_1.upperFirst(type.name);
    var code = "  // @flow\n  // This resolver file was scaffolded by github.com/prisma/graphqlgen, DO NOT EDIT.\n  // Please do not import this file directly but copy & paste to your application code.\n\n  import { " + upperTypeName + "_Resolvers } from '[TEMPLATE-INTERFACES-PATH]'\n\n  export const " + type.name + ": " + upperTypeName + "_Resolvers = {\n    __resolveType: (parent, ctx, info) => {\n      throw new Error('Resolver not implemented')\n    }\n  }";
    return { path: type.name + ".ts", force: false, code: code };
}
function renderResolvers(type, args) {
    var model = args.modelMap[type.name];
    var modelFields = common_1.fieldsFromModelDefinition(model.definition);
    var upperTypeName = utils_1.upperFirst(type.name);
    var code = "/* @flow */\n" + (args.defaultResolversEnabled
        ? "import { " + upperTypeName + "_defaultResolvers } from '[TEMPLATE-INTERFACES-PATH]'"
        : '') + "\nimport type { " + upperTypeName + "_Resolvers } from '[TEMPLATE-INTERFACES-PATH]'\n\nexport const " + type.name + ": " + upperTypeName + "_Resolvers = {\n  " + (args.defaultResolversEnabled ? "..." + upperTypeName + "_defaultResolvers," : '') + "\n  " + type.fields
        .filter(function (graphQLField) {
        return common_1.shouldScaffoldFieldResolver(graphQLField, modelFields, args);
    })
        .map(function (field) { return "\n      " + field.name + ": (parent, args, ctx, info) => {\n        throw new Error('Resolver not implemented')\n      }\n    "; }) + "\n}\n";
    return {
        path: type.name + ".js",
        force: false,
        code: code,
    };
}
function generate(args) {
    var files = args.types
        .filter(function (type) { return type.type.isObject; })
        .filter(function (type) { return !common_1.isParentType(type.name); })
        .map(function (type) { return renderResolvers(type, args); });
    files = files.concat(args.interfaces.map(function (type) { return renderPolyResolvers(type); }), args.unions.map(function (type) { return renderPolyResolvers(type); }));
    files = files.concat(args.types
        .filter(function (type) { return common_1.isParentType(type.name); })
        .map(renderParentResolvers));
    files.push({
        path: 'index.js',
        force: false,
        code: renderExports(args.types),
    });
    return files;
}
exports.generate = generate;
//# sourceMappingURL=scaffolder.js.map