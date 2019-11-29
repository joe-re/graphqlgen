"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Path = require("path");
var FS = require("fs");
var path_helpers_1 = require("./path-helpers");
/**
 * Uppercase the first letter of a string. Useful when generating type names.
 */
var upperFirst = function (s) {
    return s.replace(/^\w/, function (c) { return c.toUpperCase(); });
};
exports.upperFirst = upperFirst;
/**
 * Append a file extension to a file name. Leading dots in given
 * file extension are gracefully dropped.
 */
var appendExt = function (ext, filePath) {
    var normalizedExt = ext.replace(/^\.+/, '');
    return filePath + '.' + normalizedExt;
};
/**
 * Normalize different kinds of path notation. Will do synchronous
 * file IO to accomplish task.
 *
 * Examples:
 *
 *    ./path/to/index.ts => `pwd`/path/to/index.ts
 *    ./path/to          => `pwd`/path/to/to.ts
 *    ./path/to          => `pwd`/path/to/index.ts
 *    ./path/to/         => `pwd`/path/to/index.ts
 */
var normalizeFilePath = function (filePath, language) {
    var ext = path_helpers_1.getExtNameFromLanguage(language);
    // If the filepath is set against a file then just return that.
    if (Path.extname(filePath) === ext) {
        return Path.resolve(filePath);
    }
    // If there is no file extension then infer it (from given language) and return if
    // exists on file system. Otherwise consider file path as being to a folder that
    // mnust have an index file.
    var filePathWithExt = Path.resolve(filePath) + ext;
    if (FS.existsSync(filePathWithExt)) {
        return filePathWithExt;
    }
    return Path.join(Path.resolve(filePath), appendExt(ext, 'index'));
};
exports.normalizeFilePath = normalizeFilePath;
/**
 * Create a map of interface names to the path of the file in which they're defined
 * The first evaluated interfaces are always the chosen ones
 */
var getTypeToFileMapping = function (files, filesToTypesMap) {
    // REFACTOR: This function basically just takes an index and flips it. Make generic.
    var mapping = {};
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        // WARNING: typesMap is not typesafe since the lookup could fail.
        var typesMap = filesToTypesMap[file.path];
        var interfaceNames = Object.keys(typesMap);
        for (var _a = 0, interfaceNames_1 = interfaceNames; _a < interfaceNames_1.length; _a++) {
            var interfaceName = interfaceNames_1[_a];
            if (!mapping[interfaceName]) {
                mapping[interfaceName] = file;
            }
        }
    }
    return mapping;
};
exports.getTypeToFileMapping = getTypeToFileMapping;
/**
 * Replace all occurances of given search string in a given
 * string with another string.
 */
var replaceAll = function (str, search, replacement) {
    return str.split(search).join(replacement);
};
exports.replaceAll = replaceAll;
/**
 * Return a new array whose items are a merger of the given two arrays.
 */
var concat = function (a, b) {
    return a.concat(b);
};
exports.concat = concat;
// TODO Refactor; confusing; only one callsite
var uniq = function (value, index, array) {
    return array.indexOf(value) === index;
};
exports.uniq = uniq;
var languageExtensions = ['ts', 'js'];
exports.languageExtensions = languageExtensions;
var extToLangIndex = {
    ts: 'typescript',
    js: 'flow',
};
var langToExtIndex = {
    typescript: 'ts',
    flow: 'js',
};
var getExtFromLang = function (lang) {
    return langToExtIndex[lang];
};
exports.getExtFromLang = getExtFromLang;
var getLangFromExt = function (ext) {
    return extToLangIndex[ext];
};
exports.getLangFromExt = getLangFromExt;
/**
 * Get the extension from a file name (or path with file name).
 * Unlike Path.extname this returns null if no ext can be extracted.
 */
var getExt = function (path) {
    var ext = Path.extname(path);
    if (ext === '')
        return null;
    var extWithoutDot = ext.slice(1);
    return extWithoutDot;
};
exports.getExt = getExt;
/**
 * Predicate function for checking if a path is to file.
 * Relies on convention that a dot being present in last
 * path item is a file.
 *
 * Examples:
 *
 *    /a/b/c -> false
 *    /a/b/c.foo -> true
 */
var isFile = function (path) {
    return Path.extname(path) !== '';
};
exports.isFile = isFile;
//# sourceMappingURL=utils.js.map