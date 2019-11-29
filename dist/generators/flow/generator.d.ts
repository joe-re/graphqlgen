import * as prettier from 'prettier';
import { GenerateArgs } from '../../types';
export declare function format(code: string, options?: prettier.Options): string;
export declare function generate(args: GenerateArgs): string;
