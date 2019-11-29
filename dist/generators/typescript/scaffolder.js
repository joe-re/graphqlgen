"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("../common");
var generator_1 = require("./generator");
exports.format = generator_1.format;
function renderResolvers(type, args) {
    var model = args.modelMap[type.name];
    var modelFields = common_1.fieldsFromModelDefinition(model.definition);
    var code = "  // This resolver file was scaffolded by github.com/prisma/graphqlgen, DO NOT EDIT.\n  // Please do not import this file directly but copy & paste to your application code.\n\n  import { " + type.name + "Resolvers } from '[TEMPLATE-INTERFACES-PATH]'\n\n  export const " + type.name + ": " + type.name + "Resolvers.Type = {\n    " + (args.defaultResolversEnabled
        ? "..." + type.name + "Resolvers.defaultResolvers,"
        : '') + "\n    " + type.fields
        .filter(function (field) { return common_1.shouldScaffoldFieldResolver(field, modelFields, args); })
        .map(function (field) { return "\n      " + field.name + ": (parent, args, ctx) => {\n        throw new Error('Resolver not implemented')\n      }\n    "; }) + "\n  }";
    return { path: type.name + ".ts", force: false, code: code };
}
function renderPolyResolvers(type) {
    var code = "  // This resolver file was scaffolded by github.com/prisma/graphqlgen, DO NOT EDIT.\n  // Please do not import this file directly but copy & paste to your application code.\n\n  import { " + type.name + "Resolvers } from '[TEMPLATE-INTERFACES-PATH]'\n\n  export const " + type.name + ": " + type.name + "Resolvers.Type = {\n    __resolveType: (parent, ctx) => {\n      throw new Error('Resolver not implemented')\n    }\n  }";
    return { path: type.name + ".ts", force: false, code: code };
}
function renderParentResolvers(type, args) {
    var code = "  // This resolver file was scaffolded by github.com/prisma/graphqlgen, DO NOT EDIT.\n  // Please do not import this file directly but copy & paste to your application code.\n\n  import { " + type.name + "Resolvers } from '[TEMPLATE-INTERFACES-PATH]'\n\n  export const " + type.name + ": " + type.name + "Resolvers.Type = {\n    " + (args.defaultResolversEnabled
        ? "..." + type.name + "Resolvers.defaultResolvers,"
        : '') + "\n    " + type.fields.map(function (field) {
        if (type.name === 'Subscription') {
            return field.name + ": {\n          subscribe: (parent, args, ctx) => {\n            throw new Error('Resolver not implemented')\n          }\n        }";
        }
        return field.name + ": (parent, args, ctx) => {\n          throw new Error('Resolver not implemented')\n        }";
    }) + "\n  }\n      ";
    return {
        path: type.name + ".ts",
        force: false,
        code: code,
    };
}
function renderExports(types) {
    return "  // This resolver file was scaffolded by github.com/prisma/graphqlgen, DO NOT EDIT.\n  // Please do not import this file directly but copy & paste to your application code.\n\n  import { Resolvers } from '[TEMPLATE-INTERFACES-PATH]'\n    " + types
        .filter(function (type) { return type.type.isObject; })
        .map(function (type) { return "\n      import { " + type.name + " } from './" + type.name + "'\n    "; })
        .join(';') + "\n\n    export const resolvers: Resolvers = {\n      " + types
        .filter(function (type) { return type.type.isObject; })
        .map(function (type) { return "" + type.name; })
        .join(',') + "\n    }";
}
function generate(args) {
    var files = args.types
        .filter(function (type) { return type.type.isObject; })
        .filter(function (type) { return !common_1.isParentType(type.name); })
        .map(function (type) { return renderResolvers(type, args); });
    files = files.concat(args.interfaces.map(function (type) { return renderPolyResolvers(type); }), args.unions.map(function (type) { return renderPolyResolvers(type); }));
    files = files.concat(args.types
        .filter(function (type) { return type.type.isObject; })
        .filter(function (type) { return common_1.isParentType(type.name); })
        .map(function (type) { return renderParentResolvers(type, args); }));
    files.push({
        path: 'index.ts',
        force: false,
        code: renderExports(args.types),
    });
    return files;
}
exports.generate = generate;
//# sourceMappingURL=scaffolder.js.map