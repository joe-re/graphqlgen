import { Language } from 'graphqlgen-json-schema';
import { NormalizedFile } from './parse';
import { FilesToTypesMap, InterfaceNamesToFile } from './introspection/types';
/**
 * Uppercase the first letter of a string. Useful when generating type names.
 */
declare const upperFirst: (s: string) => string;
/**
 * Normalize different kinds of path notation. Will do synchronous
 * file IO to accomplish task.
 *
 * Examples:
 *
 *    ./path/to/index.ts => `pwd`/path/to/index.ts
 *    ./path/to          => `pwd`/path/to/to.ts
 *    ./path/to          => `pwd`/path/to/index.ts
 *    ./path/to/         => `pwd`/path/to/index.ts
 */
declare const normalizeFilePath: (filePath: string, language: Language) => string;
/**
 * Create a map of interface names to the path of the file in which they're defined
 * The first evaluated interfaces are always the chosen ones
 */
declare const getTypeToFileMapping: (files: NormalizedFile[], filesToTypesMap: FilesToTypesMap) => InterfaceNamesToFile;
/**
 * Replace all occurances of given search string in a given
 * string with another string.
 */
declare const replaceAll: (str: string, search: string, replacement: string) => string;
/**
 * Return a new array whose items are a merger of the given two arrays.
 */
declare const concat: <T = unknown>(a: T[], b: T[]) => T[];
declare const uniq: <T = unknown>(value: T, index: number, array: T[]) => boolean;
declare type LanguageExtension = 'ts' | 'js';
declare const languageExtensions: LanguageExtension[];
declare const getExtFromLang: (lang: Language) => LanguageExtension;
declare const getLangFromExt: (ext: LanguageExtension) => Language;
/**
 * Get the extension from a file name (or path with file name).
 * Unlike Path.extname this returns null if no ext can be extracted.
 */
declare const getExt: (path: string) => string | null;
/**
 * Predicate function for checking if a path is to file.
 * Relies on convention that a dot being present in last
 * path item is a file.
 *
 * Examples:
 *
 *    /a/b/c -> false
 *    /a/b/c.foo -> true
 */
declare const isFile: (path: string) => boolean;
export { LanguageExtension, languageExtensions, getLangFromExt, getExtFromLang, getTypeToFileMapping, uniq, concat, replaceAll, upperFirst, normalizeFilePath, getExt, isFile, };
