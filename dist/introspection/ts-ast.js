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
    return (node.type === 'TSTypeAliasDeclaration' ||
        node.type === 'TSInterfaceDeclaration' ||
        node.type === 'TSEnumDeclaration');
}
function computeType(node, filePath) {
    if (types_1.isTSParenthesizedType(node)) {
        node = node.typeAnnotation;
    }
    if (types_1.isTSStringKeyword(node)) {
        return factory_1.createTypeAnnotation('string');
    }
    if (types_1.isTSNumberKeyword(node)) {
        return factory_1.createTypeAnnotation('number');
    }
    if (types_1.isTSBooleanKeyword(node)) {
        return factory_1.createTypeAnnotation('boolean');
    }
    if (types_1.isTSAnyKeyword(node)) {
        return factory_1.createTypeAnnotation(null, { isAny: true });
    }
    if (types_1.isTSNullKeyword(node) || types_1.isTSUndefinedKeyword(node)) {
        return factory_1.createTypeAnnotation(null);
    }
    if (types_1.isTSTypeReference(node)) {
        var referenceTypeName = node.typeName.name;
        return factory_1.createTypeReferenceAnnotation(referenceTypeName);
    }
    if (types_1.isTSArrayType(node)) {
        var computedType = computeType(node.elementType, filePath);
        if (computedType.kind !== 'TypeReferenceAnnotation') {
            computedType.isArray = true;
        }
        return computedType;
    }
    if (types_1.isTSLiteralType(node)) {
        var literalValue = node.literal.value;
        return factory_1.createLiteralTypeAnnotation(typeof literalValue, literalValue);
    }
    if (types_1.isTSTypeLiteral(node)) {
        var fields = node.members;
        var interfaceFields = extractInterfaceFields(fields, filePath);
        return factory_1.createAnonymousInterfaceAnnotation(interfaceFields);
    }
    if (types_1.isTSUnionType(node)) {
        var unionTypes = node.types.map(function (unionType) {
            return computeType(unionType, filePath);
        });
        return factory_1.createUnionTypeAnnotation(unionTypes, filePath);
    }
    return factory_1.createTypeAnnotation('_UNKNOWN_TYPE_');
}
exports.computeType = computeType;
function extractTypeAlias(typeName, typeAlias, filePath) {
    if (types_1.isTSTypeLiteral(typeAlias.typeAnnotation)) {
        return extractInterface(typeName, typeAlias.typeAnnotation.members, filePath);
    }
    else {
        var typeAliasType = computeType(typeAlias.typeAnnotation, filePath);
        return factory_1.createTypeAlias(typeName, typeAliasType, filePath);
    }
}
// Enums are converted to TypeAlias of UnionType
// enum Enum { A, B, C } => type Enum = 'A' | 'B' | 'C'
function extractEnum(enumName, enumType, filePath) {
    if (enumType.members.some(function (enumMember) { return enumMember.id.type === 'StringLiteral'; })) {
        throw new Error("ERROR: Enum initializers not supported (" + enumName + " in " + filePath + ").");
    }
    var enumValuesAsLiteralStrings = enumType.members.map(function (enumMember) {
        return factory_1.createLiteralTypeAnnotation('string', enumMember.id.name);
    });
    var unionType = factory_1.createUnionTypeAnnotation(enumValuesAsLiteralStrings, filePath);
    return factory_1.createTypeAlias(enumName, unionType, filePath);
}
function isSupportedTypeOfField(field) {
    return types_1.isTSPropertySignature(field);
}
function extractInterfaceFieldName(field) {
    if (types_1.isTSPropertySignature(field)) {
        return field.key.type === 'Identifier'
            ? field.key.name
            : field.key.value;
    }
    return '';
}
function extractInterfaceFields(fields, filePath) {
    return fields.map(function (field) {
        var fieldName = extractInterfaceFieldName(field);
        if (!isSupportedTypeOfField(field) || !field.typeAnnotation) {
            return factory_1.createInterfaceField('', factory_1.createTypeAnnotation('_UNKNOWN_TYPE_'), filePath, false);
        }
        var fieldType = computeType(field.typeAnnotation.typeAnnotation, filePath);
        var isOptional = isFieldOptional(field);
        return factory_1.createInterfaceField(fieldName, fieldType, filePath, isOptional);
    });
}
function extractInterface(typeName, fields, filePath) {
    var interfaceFields = extractInterfaceFields(fields, filePath);
    return factory_1.createInterface(typeName, interfaceFields);
}
function findTypescriptTypes(sourceFile) {
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
    if (node.typeAnnotation &&
        node.typeAnnotation.typeAnnotation.type === 'TSNullKeyword') {
        return true;
    }
    if (node.typeAnnotation &&
        node.typeAnnotation.typeAnnotation.type === 'TSUnionType') {
        return node.typeAnnotation.typeAnnotation.types.some(function (unionType) { return unionType.type === 'TSNullKeyword'; });
    }
    return false;
}
function buildTSTypesMap(fileContent, filePath) {
    var ast = parser_1.parse(fileContent, {
        plugins: ['typescript'],
        sourceType: 'module',
    });
    var typesMap = findTypescriptTypes(ast).reduce(function (acc, type) {
        var _a, _b, _c;
        var typeName = type.id.name;
        if (types_1.isTSTypeAliasDeclaration(type)) {
            return __assign({}, acc, (_a = {}, _a[typeName] = extractTypeAlias(typeName, type, filePath), _a));
        }
        if (types_1.isTSEnumDeclaration(type)) {
            return __assign({}, acc, (_b = {}, _b[typeName] = extractEnum(typeName, type, filePath), _b));
        }
        return __assign({}, acc, (_c = {}, _c[typeName] = extractInterface(typeName, type.body.body, filePath), _c));
    }, {});
    return typesMap;
}
exports.buildTSTypesMap = buildTSTypesMap;
//# sourceMappingURL=ts-ast.js.map