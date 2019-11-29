import { GraphQLGenDefinition, Language, Models, File } from 'graphqlgen-json-schema';
import { ContextDefinition, ModelMap } from './types';
import { GraphQLTypes } from './source-helper';
export interface NormalizedFile {
    path: string;
    defaultName?: string;
}
export declare function parseConfig(): GraphQLGenDefinition;
export declare function parseContext(context: string | undefined, outputDir: string): ContextDefinition | undefined;
export declare function parseSchema(schemaPath: string): GraphQLTypes;
export declare function getPath(file: File): string;
export declare function getDefaultName(file: File): string | null;
export declare function normalizeFiles(files: File[] | undefined, language: Language): NormalizedFile[];
export declare function parseModels(models: Models, schema: GraphQLTypes, outputDir: string, language: Language): ModelMap;
interface ReplacementMap {
    [key: string]: string;
}
export declare function replaceVariablesInString(str: string, replacements: ReplacementMap): string;
export {};
