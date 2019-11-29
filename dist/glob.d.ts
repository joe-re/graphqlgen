import { File } from 'graphqlgen-json-schema';
/**
 * Returns the path array from glob patterns
 */
export declare const extractGlobPattern: (file: File) => string[];
/**
 * Handles the glob pattern of models.files
 */
export declare const handleGlobPattern: (files?: File[] | undefined) => File[];
