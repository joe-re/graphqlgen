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
var parser_1 = require("@babel/parser");
var types_1 = require("@babel/types");
var factory_1 = require("./factory");
function shouldExtractType(node) {
    return node.type === 'TypeAlias' || node.type === 'InterfaceDeclaration';
}
function findFlowTypes(sourceFile) {
    var statements = sourceFile.program.body;
    var types = statements.filter(shouldExtractType);
    var typesFromNamedExport = statements
        .filter(function (node) {
        return node.type === 'ExportNamedDeclaration' &&
            node.declaration !== null &&
            shouldExtractType(node.declaration);
    })
        .map(function (node) {
        return node.declaration;
    });
    return types.concat(typesFromNamedExport);
}
function isFieldOptional(node) {
    if (!!node.optional) {
        return true;
    }
    if (node.value.type === 'NullLiteralTypeAnnotation') {
        return true;
    }
    if (node.value.type === 'UnionTypeAnnotation') {
        return node.value.types.some(function (unionType) { return unionType.type === 'NullLiteralTypeAnnotation'; });
    }
    return false;
}
exports.isFieldOptional = isFieldOptional;
function computeType(node, filePath) {
    if (types_1.isStringTypeAnnotation(node)) {
        return factory_1.createTypeAnnotation('string');
    }
    if (types_1.isNumberTypeAnnotation(node)) {
        return factory_1.createTypeAnnotation('number');
    }
    if (types_1.isBooleanTypeAnnotation(node)) {
        return factory_1.createTypeAnnotation('boolean');
    }
    if (types_1.isAnyTypeAnnotation(node)) {
        return factory_1.createTypeAnnotation(null, { isAny: true });
    }
    if ((types_1.isGenericTypeAnnotation(node) && node.id.name === 'undefined') ||
        types_1.isNullLiteralTypeAnnotation(node)) {
        return factory_1.createTypeAnnotation(null);
    }
    if (types_1.isGenericTypeAnnotation(node)) {
        var referenceTypeName = node.id.name;
        return factory_1.createTypeReferenceAnnotation(referenceTypeName);
    }
    if (types_1.isArrayTypeAnnotation(node)) {
        var computedType = computeType(node.elementType, filePath);
        if (computedType.kind !== 'TypeReferenceAnnotation') {
            computedType.isArray = true;
        }
        return computedType;
    }
    if (types_1.isStringLiteralTypeAnnotation(node) ||
        types_1.isNumberLiteralTypeAnnotation(node) ||
        types_1.isBooleanLiteralTypeAnnotation(node)) {
        var literalValue = node.value;
        return factory_1.createLiteralTypeAnnotation(typeof literalValue, literalValue);
    }
    if (types_1.isObjectTypeAnnotation(node)) {
        var interfaceFields = extractInterfaceFields(node.properties, filePath);
        return factory_1.createAnonymousInterfaceAnnotation(interfaceFields);
    }
    if (types_1.isUnionTypeAnnotation(node)) {
        var unionTypes = node.types.map(function (unionType) {
            return computeType(unionType, filePath);
        });
        return factory_1.createUnionTypeAnnotation(unionTypes, filePath);
    }
    return factory_1.createTypeAnnotation('_UNKNOWN_TYPE_');
}
exports.computeType = computeType;
function extractTypeAlias(typeName, typeAlias, filePath) {
    if (types_1.isObjectTypeAnnotation(typeAlias.right)) {
        return extractInterface(typeName, typeAlias.right.properties, filePath);
    }
    else {
        var typeAliasType = computeType(typeAlias.right, filePath);
        return factory_1.createTypeAlias(typeName, typeAliasType, filePath);
    }
}
function isSupportedTypeOfField(field) {
    return types_1.isObjectTypeProperty(field);
}
function extractInterfaceFieldName(field) {
    if (types_1.isObjectTypeProperty(field)) {
        return field.key.type === 'Identifier'
            ? field.key.name
            : field.key.value;
    }
    return '';
}
function extractInterfaceFields(fields, filePath) {
    return fields.map(function (field) {
        var fieldName = extractInterfaceFieldName(field);
        if (!isSupportedTypeOfField(field)) {
            return factory_1.createInterfaceField('', factory_1.createTypeAnnotation('_UNKNOWN_TYPE_'), filePath, false);
        }
        var fieldAsObjectTypeProperty = field;
        var fieldType = computeType(fieldAsObjectTypeProperty.value, filePath);
        var isOptional = isFieldOptional(fieldAsObjectTypeProperty);
        return factory_1.createInterfaceField(fieldName, fieldType, filePath, isOptional);
    });
}
function extractInterface(typeName, fields, filePath) {
    var interfaceFields = extractInterfaceFields(fields, filePath);
    return factory_1.createInterface(typeName, interfaceFields);
}
function buildFlowTypesMap(fileContent, filePath) {
    var ast = parser_1.parse(fileContent, {
        plugins: ['flow'],
        sourceType: 'module',
    });
    var typesMap = findFlowTypes(ast).reduce(function (acc, type) {
        var _a, _b;
        var typeName = type.id.name;
        if (types_1.isTypeAlias(type)) {
            return __assign({}, acc, (_a = {}, _a[typeName] = extractTypeAlias(typeName, type, filePath), _a));
        }
        return __assign({}, acc, (_b = {}, _b[typeName] = extractInterface(typeName, type.body.properties, filePath), _b));
    }, {});
    return typesMap;
}
exports.buildFlowTypesMap = buildFlowTypesMap;
//# sourceMappingURL=flow-ast.js.map