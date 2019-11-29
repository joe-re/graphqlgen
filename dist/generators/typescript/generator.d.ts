import * as prettier from 'prettier';
import { GenerateArgs } from '../../types';
import { GraphQLInterfaceObject, GraphQLUnionObject } from '../../source-helper';
export declare function format(code: string, options?: prettier.Options): string;
export declare function generate(args: GenerateArgs): string;
export declare const renderTypeResolveTypeResolver: (abstractType: GraphQLUnionObject | GraphQLInterfaceObject, args: GenerateArgs) => string;
