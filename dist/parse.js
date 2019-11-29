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
var Ajv = require("ajv");
var chalk = require("chalk");
var fs = require("fs");
var yaml = require("js-yaml");
var Path = require("path");
var tsNode = require("ts-node");
var graphql_1 = require("graphql");
var graphql_import_1 = require("graphql-import");
var schema = require("graphqlgen-json-schema/dist/schema.json");
var path_helpers_1 = require("./path-helpers");
var utils_1 = require("./utils");
var source_helper_1 = require("./source-helper");
var introspection_1 = require("./introspection");
var ajv = new Ajv().addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
var validateYaml = ajv.compile(schema);
function parseConfig() {
    if (!fs.existsSync('graphqlgen.yml')) {
        console.error(chalk.default.red("No graphqlgen.yml found"));
        process.exit(1);
    }
    var config = yaml.safeLoad(fs.readFileSync('graphqlgen.yml', 'utf-8'));
    if (!validateYaml(config)) {
        console.error(chalk.default.red("Invalid graphqlgen.yml file"));
        console.error(chalk.default.red(printErrors(validateYaml.errors)));
        process.exit(1);
    }
    return config;
}
exports.parseConfig = parseConfig;
function printErrors(errors) {
    return errors
        .map(function (e) {
        var params = Object.keys(e.params)
            .map(function (key) { return key + ": " + e.params[key]; })
            .join(', ');
        return e.dataPath + " " + e.message + ". " + params;
    })
        .join('\n');
}
function parseContext(context, outputDir) {
    if (!context) {
        return undefined;
    }
    var _a = context.split(':'), filePath = _a[0], interfaceName = _a[1];
    return {
        contextPath: path_helpers_1.getImportPathRelativeToOutput(filePath, outputDir),
        interfaceName: interfaceName,
    };
}
exports.parseContext = parseContext;
function parseSchema(schemaPath) {
    var _a = schemaPath.split(':'), filePath = _a[0], _b = _a[1], exportName = _b === void 0 ? 'default' : _b;
    // We can assume absolute path is cwd prefixed because
    // gg currently only works when run in a directory with the
    // graphqlgen manifest.
    var absoluteFilePath = filePath[0] == '/' ? filePath : Path.join(process.cwd(), filePath);
    if (!fs.existsSync(absoluteFilePath)) {
        console.error(chalk.default.red("The schema file " + filePath + " does not exist"));
        process.exit(1);
    }
    var schema;
    try {
        if (filePath.endsWith('.ts')) {
            tsNode.register({
                transpileOnly: true,
            });
            var schemaModule = require(absoluteFilePath);
            var loadedSchema = schemaModule[exportName];
            if (typeof loadedSchema === 'string') {
                schema = loadedSchema;
            }
            else {
                schema = graphql_1.print(loadedSchema);
            }
        }
        else {
            schema = graphql_import_1.importSchema(filePath);
        }
    }
    catch (e) {
        console.error(chalk.default.red("Error occurred while reading schema: " + e));
        process.exit(1);
    }
    var types;
    try {
        types = source_helper_1.extractTypes(schema);
    }
    catch (e) {
        console.error(chalk.default.red("Failed to parse schema: " + e));
        process.exit(1);
    }
    return types;
}
exports.parseSchema = parseSchema;
function buildModel(modelName, filePath, filesToTypesMap, outputDir, language) {
    var absoluteFilePath = path_helpers_1.getAbsoluteFilePath(filePath, language);
    var importPathRelativeToOutput = path_helpers_1.getImportPathRelativeToOutput(absoluteFilePath, outputDir);
    return {
        absoluteFilePath: absoluteFilePath,
        importPathRelativeToOutput: importPathRelativeToOutput,
        definition: filesToTypesMap[filePath][modelName],
    };
}
function getPath(file) {
    if (typeof file === 'string') {
        return file;
    }
    return file.path;
}
exports.getPath = getPath;
function getDefaultName(file) {
    if (typeof file === 'string') {
        return null;
    }
    return file.defaultName || null;
}
exports.getDefaultName = getDefaultName;
function normalizeFiles(files, language) {
    return files !== undefined
        ? files.map(function (file) { return ({
            defaultName: typeof file === 'object' ? file.defaultName : undefined,
            path: utils_1.normalizeFilePath(getPath(file), language),
        }); })
        : [];
}
exports.normalizeFiles = normalizeFiles;
function parseModels(models, schema, outputDir, language) {
    var graphQLTypes = source_helper_1.extractGraphQLTypesWithoutRootsAndInputsAndEnums(schema);
    var normalizedFiles = normalizeFiles(models.files, language);
    var filesToTypesMap = introspection_1.getFilesToTypesMap();
    var overriddenModels = !!models.override ? models.override : {};
    var typeToFileMapping = utils_1.getTypeToFileMapping(normalizedFiles, filesToTypesMap);
    return graphQLTypes.reduce(function (acc, type) {
        var _a, _b;
        if (overriddenModels[type.name]) {
            var _c = models.override[type.name].split(':'), filePath_1 = _c[0], modelName = _c[1];
            return __assign({}, acc, (_a = {}, _a[type.name] = buildModel(modelName, utils_1.normalizeFilePath(filePath_1, language), filesToTypesMap, outputDir, language), _a));
        }
        var typeFileTuple = Object.entries(typeToFileMapping).find(function (_a) {
            var typeName = _a[0], file = _a[1];
            var defaultName = getDefaultName(file);
            var replacedTypeName = defaultName
                ? replaceVariablesInString(defaultName, { typeName: type.name })
                : type.name;
            return typeName === replacedTypeName;
        });
        if (!typeFileTuple) {
            throw new Error("Could not find type " + type.name + " in any of the provided files");
        }
        var file = typeFileTuple[1];
        var filePath = getPath(file);
        var defaultName = getDefaultName(file);
        var replacedTypeName = defaultName
            ? replaceVariablesInString(defaultName, { typeName: type.name })
            : type.name;
        return __assign({}, acc, (_b = {}, _b[type.name] = buildModel(replacedTypeName, filePath, filesToTypesMap, outputDir, language), _b));
    }, {});
}
exports.parseModels = parseModels;
function replaceVariablesInString(str, replacements) {
    var variableSyntax = RegExp('\\${([ ~:a-zA-Z0-9._\'",\\-\\/\\(\\)]+?)}', 'g');
    var newStr = str;
    if (variableSyntax.test(str)) {
        str.match(variableSyntax).forEach(function (matchedString) {
            // strip ${} away to get the pure variable name
            var variableName = matchedString
                .replace(variableSyntax, function (_, varName) { return varName.trim(); })
                .replace(/\s/g, '');
            if (replacements[variableName]) {
                newStr = utils_1.replaceAll(newStr, matchedString, replacements[variableName]);
            }
            else {
                throw new Error("Variable " + variableName + " is not covered by a value");
            }
        });
    }
    return newStr;
}
exports.replaceVariablesInString = replaceVariablesInString;
//# sourceMappingURL=parse.js.map