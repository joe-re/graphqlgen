import { Language } from 'graphqlgen-json-schema';
export declare function getExtNameFromLanguage(language: Language): string;
export declare function getAbsoluteFilePath(modelPath: string, language: Language): string;
export declare function getImportPathRelativeToOutput(absolutePath: string, outputDir: string): string;
