/** Our own GraphQL schema/types abstraction. */
export declare type GraphQLTypes = {
    types: GraphQLTypeObject[];
    unions: GraphQLUnionObject[];
    enums: GraphQLEnumObject[];
    interfaces: GraphQLInterfaceObject[];
};
/** Converts typeDefs, e.g. the raw SDL string, into our `GraphQLTypes`. */
export declare function extractTypes(typeDefs: string): GraphQLTypes;
export declare type GraphQLTypeDefinition = {
    name: string;
    isScalar: boolean;
    isEnum: boolean;
    isUnion: boolean;
    isInput: boolean;
    isObject: boolean;
    isInterface: boolean;
};
export declare type GraphQLType = GraphQLTypeDefinition & {
    isArray: boolean;
    isArrayRequired: boolean;
    isRequired: boolean;
};
export declare type GraphQLTypeArgument = {
    name: string;
    type: GraphQLType;
    defaultValue?: unknown;
};
export declare type GraphQLTypeField = {
    name: string;
    type: GraphQLType;
    defaultValue?: unknown;
    arguments: GraphQLTypeArgument[];
};
export declare type GraphQLTypeObject = {
    name: string;
    type: GraphQLTypeDefinition;
    fields: GraphQLTypeField[];
    implements: null | string[];
};
export declare type GraphQLEnumObject = {
    name: string;
    type: GraphQLTypeDefinition;
    values: string[];
};
export declare type GraphQLUnionObject = {
    name: string;
    kind: 'union';
    type: GraphQLTypeDefinition;
    types: GraphQLTypeDefinition[];
};
export declare type GraphQLInterfaceObject = {
    name: string;
    kind: 'interface';
    type: GraphQLTypeDefinition;
    fields: GraphQLTypeField[];
    implementors: GraphQLTypeDefinition[];
};
export declare const GraphQLScalarTypeArray: string[];
export declare type GraphQLScalarType = 'Boolean' | 'Float' | 'Int' | 'String' | 'ID';
export declare function graphQLToTypecriptFlowType(type: GraphQLType): string;
export declare function extractGraphQLTypesWithoutRootsAndInputsAndEnums(schema: GraphQLTypes): GraphQLTypeObject[];
export declare function getGraphQLEnumValues(enumField: GraphQLTypeField, graphQLEnumObjects: GraphQLEnumObject[]): string[];
