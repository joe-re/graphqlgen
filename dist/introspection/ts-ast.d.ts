import { TSType } from '@babel/types';
import { TypesMap, InternalInnerType } from './types';
export declare function computeType(node: TSType, filePath: string): InternalInnerType;
export declare function buildTSTypesMap(fileContent: string, filePath: string): TypesMap;
