import { InternalInnerType, TypeAliasDefinition, FieldDefinition, InterfaceDefinition, Scalar, ScalarTypeAnnotation, UnionTypeAnnotation, AnonymousInterfaceAnnotation, LiteralTypeAnnotation, TypeReferenceAnnotation, UnknownType } from './types';
export declare function createTypeAlias(name: string, type: InternalInnerType, filePath: string): TypeAliasDefinition;
export declare function createInterfaceField(name: string, type: InternalInnerType, filePath: string, optional: boolean): FieldDefinition;
export declare function createInterface(name: string, fields: FieldDefinition[]): InterfaceDefinition;
interface TypeAnnotationOpts {
    isArray?: boolean;
    isTypeRef?: boolean;
    isAny?: boolean;
}
export declare function createTypeAnnotation(type: Scalar | UnknownType, options?: TypeAnnotationOpts): ScalarTypeAnnotation;
export declare function createUnionTypeAnnotation(types: InternalInnerType[], filePath: string): UnionTypeAnnotation;
export declare function createAnonymousInterfaceAnnotation(fields: FieldDefinition[], isArray?: boolean): AnonymousInterfaceAnnotation;
export declare function createLiteralTypeAnnotation(type: string, value: string | number | boolean, isArray?: boolean): LiteralTypeAnnotation;
export declare function createTypeReferenceAnnotation(referenceType: string): TypeReferenceAnnotation;
export {};
