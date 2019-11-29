import { GraphQLGenDefinition, Language, Models } from 'graphqlgen-json-schema';
import { GraphQLTypes } from './source-helper';
declare type Definition = {
    typeName: string;
    rawDefinition: string;
    filePath?: string;
    modelName?: string;
};
export declare type ValidatedDefinition = {
    definition: Definition;
    validSyntax: boolean;
    fileExists: boolean;
    interfaceExists: boolean;
};
export declare function validateConfig(config: GraphQLGenDefinition, schema: GraphQLTypes): boolean;
export declare function validateModels(models: Models, schema: GraphQLTypes, language: Language): boolean;
export declare function maybeReplaceDefaultName(typeName: string, defaultName?: string | null): string;
export declare function validateDefinition(typeName: string, definition: string, language: Language): ValidatedDefinition;
export {};
