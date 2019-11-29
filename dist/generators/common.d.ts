import { GraphQLTypeObject, GraphQLTypeDefinition, GraphQLTypeField, GraphQLInterfaceObject, GraphQLUnionObject } from '../source-helper';
import { ModelMap, ContextDefinition, GenerateArgs, Model } from '../types';
import { TypeDefinition, FieldDefinition } from '../introspection/types';
declare type SpecificGraphQLScalarType = 'boolean' | 'number' | 'string';
export interface InputTypesMap {
    [inputTypeName: string]: GraphQLTypeObject;
}
export interface TypeToInputTypeAssociation {
    [objectTypeName: string]: string[];
}
export declare type InterfacesMap = Record<string, GraphQLTypeDefinition[]>;
export declare const createInterfacesMap: (interfaces: GraphQLInterfaceObject[]) => Record<string, GraphQLTypeDefinition[]>;
export declare type UnionsMap = Record<string, GraphQLTypeDefinition[]>;
export declare const createUnionsMap: (unions: GraphQLUnionObject[]) => Record<string, GraphQLTypeDefinition[]>;
export declare function fieldsFromModelDefinition(modelDef: TypeDefinition): FieldDefinition[];
export declare function renderDefaultResolvers(graphQLTypeObject: GraphQLTypeObject, args: GenerateArgs, variableName: string): string;
export declare function getContextName(context?: ContextDefinition): string;
export declare function getModelName(type: GraphQLTypeDefinition, modelMap: ModelMap, emptyType?: string): string;
export declare function shouldScaffoldFieldResolver(graphQLField: GraphQLTypeField, modelFields: FieldDefinition[], args: GenerateArgs): boolean;
export declare const kv: (key: string, value: string, isOptional?: boolean) => string;
export declare const union: (types: string[]) => string;
export declare const resolverReturnType: (returnType: string) => string;
declare type FieldPrintOptions = {
    isReturn?: boolean;
};
export declare const printFieldLikeType: (field: GraphQLTypeField, modelMap: ModelMap, interfacesMap: Record<string, GraphQLTypeDefinition[]>, unionsMap: Record<string, GraphQLTypeDefinition[]>, options?: FieldPrintOptions) => string;
export declare function getTypeFromGraphQLType(type: string): SpecificGraphQLScalarType;
export declare const getDistinctInputTypes: (type: GraphQLTypeObject, typeToInputTypeAssociation: TypeToInputTypeAssociation, inputTypesMap: InputTypesMap) => string[];
export declare function renderEnums(args: GenerateArgs): string;
export declare function isParentType(name: string): boolean;
export declare function groupModelsNameByImportPath(models: Model[]): {
    [importPath: string]: string[];
};
export {};
