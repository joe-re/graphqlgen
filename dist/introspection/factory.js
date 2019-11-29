"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var index_1 = require("./index");
function createTypeAlias(name, type, filePath) {
    return {
        kind: 'TypeAliasDefinition',
        name: name,
        getType: utils_1.buildTypeGetter(type, filePath),
        isEnum: function () {
            return type.kind === 'UnionTypeAnnotation' && utils_1.isEnumUnion(type.getTypes());
        },
    };
}
exports.createTypeAlias = createTypeAlias;
function createInterfaceField(name, type, filePath, optional) {
    return {
        name: name,
        getType: utils_1.buildTypeGetter(type, filePath),
        optional: optional,
    };
}
exports.createInterfaceField = createInterfaceField;
function createInterface(name, fields) {
    return {
        kind: 'InterfaceDefinition',
        name: name,
        fields: fields,
    };
}
exports.createInterface = createInterface;
function createTypeAnnotation(type, options) {
    var opts = {};
    if (options === undefined) {
        opts = { isArray: false, isTypeRef: false, isAny: false };
    }
    else {
        opts = {
            isArray: options.isArray === undefined ? false : options.isArray,
            isAny: options.isAny === undefined ? false : options.isAny,
        };
    }
    var isArray = opts.isArray === undefined ? false : opts.isArray;
    return {
        kind: 'ScalarTypeAnnotation',
        type: type,
        isArray: isArray,
    };
}
exports.createTypeAnnotation = createTypeAnnotation;
function createUnionTypeAnnotation(types, filePath) {
    var getTypes = function () {
        return types.map(function (unionType) {
            return unionType.kind === 'TypeReferenceAnnotation'
                ? index_1.filesToTypesMap[filePath][unionType.referenceType]
                : unionType;
        });
    };
    return {
        kind: 'UnionTypeAnnotation',
        getTypes: getTypes,
        isArray: false,
        isEnum: function () { return utils_1.isEnumUnion(getTypes()); },
    };
}
exports.createUnionTypeAnnotation = createUnionTypeAnnotation;
function createAnonymousInterfaceAnnotation(fields, isArray) {
    if (isArray === void 0) { isArray = false; }
    return {
        kind: 'AnonymousInterfaceAnnotation',
        fields: fields,
        isArray: isArray,
    };
}
exports.createAnonymousInterfaceAnnotation = createAnonymousInterfaceAnnotation;
function createLiteralTypeAnnotation(type, value, isArray) {
    if (isArray === void 0) { isArray = false; }
    return {
        kind: 'LiteralTypeAnnotation',
        type: type,
        value: value,
        isArray: isArray,
    };
}
exports.createLiteralTypeAnnotation = createLiteralTypeAnnotation;
function createTypeReferenceAnnotation(referenceType) {
    return { kind: 'TypeReferenceAnnotation', referenceType: referenceType };
}
exports.createTypeReferenceAnnotation = createTypeReferenceAnnotation;
//# sourceMappingURL=factory.js.map