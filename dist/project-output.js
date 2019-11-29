"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Path = require("path");
var FS = require("fs");
var mkdirp = require("mkdirp");
var chalk_1 = require("chalk");
var path_helpers_1 = require("./path-helpers");
var utils_1 = require("./utils");
function writeChangesOnly(filename, content) {
    if (!FS.existsSync(filename) ||
        FS.readFileSync(filename, { encoding: 'utf-8' }) !== content) {
        console.log(chalk_1.default.green("Overriding " + filename + " with new model"));
        FS.writeFileSync(filename, content);
    }
    else {
        console.log(chalk_1.default.gray("File " + filename + " is the same"));
    }
}
/**
 * Bootstrap a graphqlgen config for the user to finish configuring.
 */
var writeConfigScaffolding = function () {
    var yaml = "# The target programming language for the generated code\nlanguage: typescript\n\n# The file path pointing to your GraphQL schema\nschema: <path-to-your-schema>.graphql\n\n# Type definition for the resolver context object\ncontext: <path-to-file>:<name-of-interface>\n\n# Map SDL types from the GraphQL schema to TS models\nmodels:\n  files:\n    - <path-to-file>.ts\n\n# Generated typings for resolvers and default resolver implementations\n# Please don't edit this file but just import from here\noutput: <path-to-generated-file>/graphqlgen.ts\n\n# Temporary scaffolded resolvers to copy and paste in your application\nresolver-scaffolding:\n  output: <path-to-output-dir>\n  layout: file-per-type\n";
    var outputPath = Path.join(process.cwd(), 'graphqlgen.yml');
    if (FS.existsSync(outputPath)) {
        return console.log(chalk_1.default.red('graphqlgen.yml file already exists'));
    }
    try {
        FS.writeFileSync(outputPath, yaml, { encoding: 'utf-8' });
    }
    catch (e) {
        return console.error(chalk_1.default.red("Failed to write the graphqlgen.yml file, error: " + e));
    }
    console.log(chalk_1.default.green('graphqlgen.yml file created'));
};
exports.writeConfigScaffolding = writeConfigScaffolding;
/**
 * Output the generated resolver types.
 */
var writeTypes = function (types, config) {
    // Create generation target folder, if it does not exist
    // TODO: Error handling around this
    mkdirp.sync(Path.dirname(config.output));
    try {
        writeChangesOnly(config.output, types);
    }
    catch (e) {
        console.error(chalk_1.default.red("Failed to write the file at " + config.output + ", error: " + e));
        process.exit(1);
    }
    console.log(chalk_1.default.green("Type definitions for your resolvers generated at " + config.output));
};
exports.writeTypes = writeTypes;
/**
 * Output scaffolded resolvers.
 */
var writeResolversScaffolding = function (resolvers, config) {
    if (!config['resolver-scaffolding']) {
        return;
    }
    var outputResolversDir = config['resolver-scaffolding'].output;
    var toBeCreatedFiles = resolvers.map(function (f) {
        return Path.join(outputResolversDir, f.path);
    });
    if (FS.existsSync(outputResolversDir)) {
        FS.readdirSync(outputResolversDir)
            .map(function (f) { return Path.join(outputResolversDir, f); })
            .filter(function (f) { return !toBeCreatedFiles.includes(f); })
            .forEach(function (f) {
            FS.unlinkSync(f);
            console.log(chalk_1.default.yellow("Deleting file " + f + " - model scaffold no long available"));
        });
    }
    resolvers.forEach(function (f) {
        var writePath = Path.join(outputResolversDir, f.path);
        mkdirp.sync(Path.dirname(writePath));
        try {
            writeChangesOnly(writePath, utils_1.replaceAll(f.code, '[TEMPLATE-INTERFACES-PATH]', path_helpers_1.getImportPathRelativeToOutput(path_helpers_1.getAbsoluteFilePath(config.output, config.language), writePath)));
        }
        catch (e) {
            console.error(chalk_1.default.red("Failed to write the file at " + outputResolversDir + ", error: " + e));
            process.exit(1);
        }
    });
    console.log(chalk_1.default.green("Resolvers scaffolded for you at " + outputResolversDir));
};
exports.writeResolversScaffolding = writeResolversScaffolding;
//# sourceMappingURL=project-output.js.map