#!/usr/bin/env node
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var prettier = require("prettier");
var yargs = require("yargs");
var generator_1 = require("./generators/typescript/generator");
var generator_2 = require("./generators/flow/generator");
var scaffolder_1 = require("./generators/typescript/scaffolder");
var scaffolder_2 = require("./generators/flow/scaffolder");
var parse_1 = require("./parse");
var validation_1 = require("./validation");
var glob_1 = require("./glob");
var Project = require("./project-output");
function getTypesGenerator(language) {
    switch (language) {
        case 'typescript':
            return { generate: generator_1.generate, format: generator_1.format };
        case 'flow':
            return { generate: generator_2.generate, format: generator_2.format };
    }
}
function getResolversGenerator(language) {
    switch (language) {
        case 'typescript':
            return { generate: scaffolder_1.generate, format: generator_1.format };
        case 'flow':
            return { generate: scaffolder_2.generate, format: generator_2.format };
    }
}
function generateTypes(generateArgs, generateCodeArgs) {
    var generatorFn = getTypesGenerator(generateCodeArgs.language);
    var generatedTypes = generatorFn.generate(generateArgs);
    return generateCodeArgs.prettify
        ? generatorFn.format(generatedTypes, generateCodeArgs.prettifyOptions)
        : generatedTypes;
}
function generateResolvers(generateArgs, generateCodeArgs) {
    var generatorFn = getResolversGenerator(generateCodeArgs.language);
    var generatedResolvers = generatorFn.generate(generateArgs);
    return generatedResolvers.map(function (r) {
        return {
            path: r.path,
            force: r.force,
            code: generateCodeArgs.prettify
                ? generatorFn.format(r.code, generateCodeArgs.prettifyOptions)
                : r.code,
        };
    });
}
function generateCode(codeGenArgs) {
    var generateArgs = {
        enums: codeGenArgs.schema.enums,
        interfaces: codeGenArgs.schema.interfaces,
        types: codeGenArgs.schema.types,
        unions: codeGenArgs.schema.unions,
        modelMap: codeGenArgs.modelMap,
        context: parse_1.parseContext(codeGenArgs.config.context, codeGenArgs.config.output),
        defaultResolversEnabled: typeof codeGenArgs.config['default-resolvers'] === 'boolean'
            ? codeGenArgs.config['default-resolvers']
            : true,
        iResolversAugmentationEnabled: typeof codeGenArgs.config['iresolvers-augmentation'] === 'boolean'
            ? codeGenArgs.config['iresolvers-augmentation']
            : true,
        delegatedParentResolversEnabled: typeof codeGenArgs.config['delegated-parent-resolvers'] === 'boolean'
            ? codeGenArgs.config['delegated-parent-resolvers']
            : false,
    };
    var generatedTypes = generateTypes(generateArgs, codeGenArgs);
    var generatedResolvers = codeGenArgs.config['resolver-scaffolding']
        ? generateResolvers(generateArgs, codeGenArgs)
        : undefined;
    // const generatedModels = generateModels(generateArgs, {schema, prettify, prettifyOptions, language})
    return { generatedTypes: generatedTypes, generatedResolvers: generatedResolvers };
}
exports.generateCode = generateCode;
/**
 * The CLI interface
 */
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var argv, config, parsedSchema, modelMap, options, _a, generatedTypes, generatedResolvers;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    argv = yargs
                        .usage('Usage: graphqlgen or gg')
                        .alias('i', 'init')
                        .describe('i', 'Initialize a graphqlgen.yml file')
                        .alias('v', 'version')
                        .describe('v', 'Print the version of graphqlgen')
                        .version()
                        .strict()
                        .help('h')
                        .alias('h', 'help').argv;
                    if (argv.i) {
                        Project.writeConfigScaffolding();
                        return [2 /*return*/, true];
                    }
                    config = parse_1.parseConfig();
                    parsedSchema = parse_1.parseSchema(config.schema);
                    // Override the config.models.files using handleGlobPattern
                    config.models = __assign({}, config.models, { files: glob_1.handleGlobPattern(config.models.files) });
                    if (!validation_1.validateConfig(config, parsedSchema)) {
                        return [2 /*return*/, false];
                    }
                    modelMap = parse_1.parseModels(config.models, parsedSchema, config.output, config.language);
                    return [4 /*yield*/, prettier.resolveConfig(process.cwd())];
                case 1:
                    options = (_b.sent()) || {} // TODO: Abstract this TS specific behavior better
                    ;
                    if (JSON.stringify(options) !== '{}') {
                        console.log(chalk_1.default.blue("Found a prettier configuration to use"));
                    }
                    _a = generateCode({
                        schema: parsedSchema,
                        language: config.language,
                        prettify: true,
                        prettifyOptions: options,
                        config: config,
                        modelMap: modelMap,
                    }), generatedTypes = _a.generatedTypes, generatedResolvers = _a.generatedResolvers;
                    Project.writeTypes(generatedTypes, config);
                    if (config['resolver-scaffolding']) {
                        Project.writeResolversScaffolding(generatedResolvers, config);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Only call run when running from CLI, not when included for tests
if (require.main === module) {
    run();
}
//# sourceMappingURL=index.js.map