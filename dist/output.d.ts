import { GraphQLTypeObject } from './source-helper';
import { ValidatedDefinition } from './validation';
import { Language } from 'graphqlgen-json-schema';
export declare function outputDefinitionFilesNotFound(validatedDefinitions: ValidatedDefinition[]): void;
export declare function outputWrongSyntaxFiles(validatedDefinitions: ValidatedDefinition[]): void;
export declare function outputInterfaceDefinitionsNotFound(validatedDefinitions: ValidatedDefinition[]): void;
export declare function outputMissingModels(missingModels: GraphQLTypeObject[], language: Language, defaultName: string | null): void;
export declare function outputModelFilesNotFound(filesNotFound: string[]): void;
