"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var fs_1 = require("fs");
var output_1 = require("./output");
var source_helper_1 = require("./source-helper");
var utils_1 = require("./utils");
var parse_1 = require("./parse");
var introspection_1 = require("./introspection");
function validateConfig(config, schema) {
    var language = config.language;
    if (!validateContext(config.context, language)) {
        return false;
    }
    return validateModels(config.models, schema, language);
}
exports.validateConfig = validateConfig;
function validateContext(contextDefinition, language) {
    if (!contextDefinition) {
        return true;
    }
    var validatedContext = validateDefinition('Context', contextDefinition, language);
    if (!validatedContext.validSyntax) {
        console.log(chalk_1.default.redBright("Invalid context: '" + chalk_1.default.bold(validatedContext.definition.rawDefinition) + "' does not follow '" + chalk_1.default.bold('context: <filePath>:<interfaceName>') + "' syntax)"));
        return false;
    }
    if (!validatedContext.fileExists) {
        console.log(chalk_1.default.redBright("Invalid context: file '" + chalk_1.default.bold(validatedContext.definition.filePath) + "' not found"));
        return false;
    }
    if (!validatedContext.interfaceExists) {
        console.log(chalk_1.default.redBright("Invalid context: interface '" + chalk_1.default.bold(validatedContext.definition.modelName) + "' not found in file '" + chalk_1.default.bold(validatedContext.definition.filePath) + "'"));
        return false;
    }
    return true;
}
function validateModels(models, schema, language) {
    var normalizedFiles = parse_1.normalizeFiles(models.files, language);
    var overriddenModels = !!models.override ? models.override : {};
    // Make sure all files exist
    if (normalizedFiles.length > 0) {
        var invalidFiles = normalizedFiles.filter(function (file) { return !fs_1.existsSync(parse_1.getPath(file)); });
        if (invalidFiles.length > 0) {
            output_1.outputModelFilesNotFound(invalidFiles.map(function (f) { return f.path; }));
            return false;
        }
    }
    // Then validate all overridden models
    var validatedOverriddenModels = Object.keys(overriddenModels).map(function (typeName) {
        return validateDefinition(typeName, models.override[typeName], language);
    });
    if (!testValidatedDefinitions(validatedOverriddenModels)) {
        return false;
    }
    // Then check whether there's a 1-1 mapping between schema types and models
    return validateSchemaToModelMapping(schema, validatedOverriddenModels, normalizedFiles, language);
}
exports.validateModels = validateModels;
function testValidatedDefinitions(validatedOverridenModels) {
    // Check whether the syntax in correct
    if (validatedOverridenModels.some(function (validation) { return !validation.validSyntax; })) {
        output_1.outputWrongSyntaxFiles(validatedOverridenModels);
        return false;
    }
    // Check whether the model file exist
    if (validatedOverridenModels.some(function (validation) { return !validation.fileExists; })) {
        output_1.outputDefinitionFilesNotFound(validatedOverridenModels);
        return false;
    }
    // Check whether the interface inside the model file exist
    if (validatedOverridenModels.some(function (validation) { return !validation.interfaceExists; })) {
        output_1.outputInterfaceDefinitionsNotFound(validatedOverridenModels);
        return false;
    }
    return true;
}
function validateSchemaToModelMapping(schema, validatedOverriddenModels, normalizedFiles, language) {
    var graphQLTypes = source_helper_1.extractGraphQLTypesWithoutRootsAndInputsAndEnums(schema);
    var overridenTypeNames = validatedOverriddenModels.map(function (def) { return def.definition.typeName; });
    var filesToTypesMap = introspection_1.addFilesToTypesMap(normalizedFiles, language);
    var interfaceNamesToPath = utils_1.getTypeToFileMapping(normalizedFiles, filesToTypesMap);
    var missingModels = graphQLTypes.filter(function (type) {
        // If some overridden models are mapped to a GraphQL type, consider them valid
        if (overridenTypeNames.some(function (typeName) { return typeName === type.name; })) {
            return false;
        }
        // If an interface is found with the same name as a GraphQL type, consider them valid
        var typeHasMappingWithAFile = Object.keys(interfaceNamesToPath).some(function (interfaceName) {
            var file = interfaceNamesToPath[interfaceName];
            var defaultName = parse_1.getDefaultName(file);
            return interfaceName === maybeReplaceDefaultName(type.name, defaultName);
        });
        return !typeHasMappingWithAFile;
    });
    if (missingModels.length > 0) {
        // Append the user's chosen defaultName pattern to the step 1 missing models,
        // but only if they have the same pattern for all of their files
        var defaultName = null;
        if (normalizedFiles.length > 0) {
            var names_1 = normalizedFiles.map(parse_1.getDefaultName);
            if (names_1.every(function (name) { return name === names_1[0]; })) {
                defaultName = names_1[0];
            }
        }
        output_1.outputMissingModels(missingModels, language, defaultName);
        return false;
    }
    return true;
}
function maybeReplaceDefaultName(typeName, defaultName) {
    return defaultName
        ? parse_1.replaceVariablesInString(defaultName, { typeName: typeName })
        : typeName;
}
exports.maybeReplaceDefaultName = maybeReplaceDefaultName;
function validateDefinition(typeName, definition, language) {
    var validation = {
        definition: {
            typeName: typeName,
            rawDefinition: definition,
        },
        validSyntax: true,
        fileExists: true,
        interfaceExists: true,
    };
    if (definition.split(':').length !== 2) {
        validation.validSyntax = false;
        validation.fileExists = false;
        validation.interfaceExists = false;
        return validation;
    }
    var _a = definition.split(':'), filePath = _a[0], modelName = _a[1];
    validation.definition.filePath = filePath;
    validation.definition.modelName = modelName;
    var normalizedFilePath = utils_1.normalizeFilePath(filePath, language);
    if (!fs_1.existsSync(normalizedFilePath)) {
        validation.fileExists = false;
        validation.interfaceExists = false;
        return validation;
    }
    if (!introspection_1.findTypeInFile(normalizedFilePath, modelName, language)) {
        validation.interfaceExists = false;
    }
    return validation;
}
exports.validateDefinition = validateDefinition;
//# sourceMappingURL=validation.js.map