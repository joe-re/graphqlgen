"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
function buildTypeGetter(type, filePath) {
    if (type.kind === 'TypeReferenceAnnotation') {
        return function () { return index_1.filesToTypesMap[filePath][type.referenceType]; };
    }
    else {
        return function () { return type; };
    }
}
exports.buildTypeGetter = buildTypeGetter;
function isFieldDefinitionEnumOrLiteral(modelFieldType) {
    // If type is: 'value'
    if (isLiteralString(modelFieldType)) {
        return true;
    }
    if (modelFieldType.kind === 'UnionTypeAnnotation' &&
        modelFieldType.isEnum()) {
        return true;
    }
    // If type is: type X = 'value'
    if (modelFieldType.kind === 'TypeAliasDefinition' &&
        isLiteralString(modelFieldType.getType())) {
        return true;
    }
    // If type is: Type X = 'value' | 'value2'
    return (modelFieldType.kind === 'TypeAliasDefinition' && modelFieldType.isEnum());
}
exports.isFieldDefinitionEnumOrLiteral = isFieldDefinitionEnumOrLiteral;
function isLiteralString(type) {
    return type.kind === 'LiteralTypeAnnotation' && type.type === 'string';
}
exports.isLiteralString = isLiteralString;
function getEnumValues(type) {
    // If type is: 'value'
    if (isLiteralString(type)) {
        return [type.value];
    }
    if (type.kind === 'TypeAliasDefinition' && isLiteralString(type.getType())) {
        return [type.getType().value];
    }
    var unionTypes = [];
    if (type.kind === 'TypeAliasDefinition' && type.isEnum()) {
        unionTypes = type.getType().getTypes();
    }
    else if (type.kind === 'UnionTypeAnnotation' && type.isEnum) {
        unionTypes = type.getTypes();
    }
    else {
        return [];
    }
    return unionTypes.map(function (unionType) {
        return unionType.value;
    });
}
exports.getEnumValues = getEnumValues;
function isEnumUnion(unionTypes) {
    return unionTypes.every(function (unionType) {
        return (unionType.kind === 'LiteralTypeAnnotation' &&
            unionType.isArray === false &&
            unionType.type === 'string');
    });
}
exports.isEnumUnion = isEnumUnion;
//# sourceMappingURL=utils.js.map