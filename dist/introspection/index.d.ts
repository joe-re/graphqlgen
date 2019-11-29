import { Language } from 'graphqlgen-json-schema';
import { FilesToTypesMap, TypeDefinition, TypesMap } from './types';
import { NormalizedFile } from '../parse';
export declare const filesToTypesMap: {
    [filePath: string]: TypesMap;
};
export declare function addFileToTypesMap(filePath: string, language: Language): TypesMap;
export declare function findTypeInFile(filePath: string, typeName: string, language: Language): TypeDefinition | undefined;
export declare function addFilesToTypesMap(files: NormalizedFile[], language: Language): FilesToTypesMap;
export declare function getFilesToTypesMap(): {
    [filePath: string]: TypesMap;
};
