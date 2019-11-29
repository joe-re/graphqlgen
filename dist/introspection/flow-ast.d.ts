import { ObjectTypeProperty, FlowType } from '@babel/types';
import { TypesMap, InternalInnerType } from './types';
export declare function isFieldOptional(node: ObjectTypeProperty): boolean;
export declare function computeType(node: FlowType, filePath: string): InternalInnerType;
export declare function buildFlowTypesMap(fileContent: string, filePath: string): TypesMap;
