import { InnerAndTypeDefinition, InternalInnerType } from './types';
export declare function buildTypeGetter(type: InternalInnerType, filePath: string): () => InnerAndTypeDefinition;
export declare function isFieldDefinitionEnumOrLiteral(modelFieldType: InnerAndTypeDefinition): boolean;
export declare function isLiteralString(type: InnerAndTypeDefinition): boolean;
export declare function getEnumValues(type: InnerAndTypeDefinition): string[];
export declare function isEnumUnion(unionTypes: InnerAndTypeDefinition[]): boolean;
