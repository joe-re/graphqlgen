"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var ts_ast_1 = require("./ts-ast");
var flow_ast_1 = require("./flow-ast");
exports.filesToTypesMap = {};
function buildTypesMapByLanguage(fileContent, filePath, language) {
    switch (language) {
        case 'typescript':
            return ts_ast_1.buildTSTypesMap(fileContent, filePath);
        case 'flow':
            return flow_ast_1.buildFlowTypesMap(fileContent, filePath);
    }
}
function addFileToTypesMap(filePath, language) {
    if (exports.filesToTypesMap[filePath] !== undefined) {
        return exports.filesToTypesMap[filePath];
    }
    var fileContent = fs.readFileSync(filePath).toString();
    var typesMap = buildTypesMapByLanguage(fileContent, filePath, language);
    exports.filesToTypesMap[filePath] = typesMap;
    return typesMap;
}
exports.addFileToTypesMap = addFileToTypesMap;
function findTypeInFile(filePath, typeName, language) {
    addFileToTypesMap(filePath, language);
    return exports.filesToTypesMap[filePath][typeName];
}
exports.findTypeInFile = findTypeInFile;
function addFilesToTypesMap(files, language) {
    files.forEach(function (file) {
        addFileToTypesMap(file.path, language);
    });
    return exports.filesToTypesMap;
}
exports.addFilesToTypesMap = addFilesToTypesMap;
function getFilesToTypesMap() {
    return exports.filesToTypesMap;
}
exports.getFilesToTypesMap = getFilesToTypesMap;
//# sourceMappingURL=index.js.map