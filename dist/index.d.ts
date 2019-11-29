#!/usr/bin/env node
import * as prettier from 'prettier';
import { GraphQLGenDefinition, Language } from 'graphqlgen-json-schema';
import { GraphQLTypes } from './source-helper';
import { CodeFileLike, ModelMap } from './types';
export declare type CodeGenArgs = {
    schema: GraphQLTypes;
    config: GraphQLGenDefinition;
    modelMap: ModelMap;
    prettify?: boolean;
    prettifyOptions?: prettier.Options;
    language: Language;
};
declare type CodeGenResult = {
    generatedTypes: string;
    generatedResolvers?: CodeFileLike[];
};
export declare function generateCode(codeGenArgs: CodeGenArgs): CodeGenResult;
export {};
