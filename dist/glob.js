"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var glob = require("glob");
var parse_1 = require("./parse");
/**
 * Returns the path array from glob patterns
 */
exports.extractGlobPattern = function (file) {
    return glob.sync(parse_1.getPath(file));
};
/**
 * Handles the glob pattern of models.files
 */
exports.handleGlobPattern = function (files) {
    if (!files) {
        return [];
    }
    return files.reduce(function (acc, file) {
        var globedPaths = exports.extractGlobPattern(file);
        if (globedPaths.length === 0) {
            return acc.concat([file]);
        }
        var globedFiles = globedPaths.map(function (path) {
            if (typeof file === 'string') {
                return path;
            }
            return {
                path: path,
                defaultName: file.defaultName,
            };
        });
        return acc.concat(globedFiles);
    }, []);
};
//# sourceMappingURL=glob.js.map