import { File } from 'graphqlgen-json-schema';
export declare type InnerType = ScalarTypeAnnotation | UnionTypeAnnotation | AnonymousInterfaceAnnotation | LiteralTypeAnnotation;
export declare type InternalInnerType = InnerType | TypeReferenceAnnotation;
export declare type UnknownType = '_UNKNOWN_TYPE_';
export declare type Scalar = 'string' | 'number' | 'boolean' | null;
export declare type TypeDefinition = InterfaceDefinition | TypeAliasDefinition;
export declare type InnerAndTypeDefinition = InnerType | TypeDefinition;
declare type Defer<T> = () => T;
interface BaseTypeDefinition {
    name: string;
}
export interface InterfaceDefinition extends BaseTypeDefinition {
    kind: 'InterfaceDefinition';
    fields: FieldDefinition[];
}
export interface FieldDefinition {
    name: string;
    getType: Defer<InnerAndTypeDefinition>;
    optional: boolean;
}
export interface TypeAliasDefinition extends BaseTypeDefinition {
    kind: 'TypeAliasDefinition';
    getType: Defer<InnerAndTypeDefinition>;
    isEnum: Defer<boolean>;
}
export interface UnionTypeAnnotation {
    kind: 'UnionTypeAnnotation';
    getTypes: Defer<InnerAndTypeDefinition[]>;
    isArray: boolean;
    isEnum: Defer<boolean>;
}
export interface ScalarTypeAnnotation {
    kind: 'ScalarTypeAnnotation';
    type: Scalar | UnknownType;
    isArray: boolean;
}
export interface AnonymousInterfaceAnnotation {
    kind: 'AnonymousInterfaceAnnotation';
    fields: FieldDefinition[];
    isArray: boolean;
}
export interface TypeReferenceAnnotation {
    kind: 'TypeReferenceAnnotation';
    referenceType: string;
}
export interface LiteralTypeAnnotation {
    kind: 'LiteralTypeAnnotation';
    type: string;
    value: string | number | boolean;
    isArray: boolean;
}
export interface TypesMap {
    [typeName: string]: TypeDefinition;
}
export interface FilesToTypesMap {
    [filePath: string]: TypesMap;
}
export interface InterfaceNamesToFile {
    [interfaceName: string]: File;
}
export {};
