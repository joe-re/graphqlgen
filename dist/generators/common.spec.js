"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Common = require("./common");
it('getDistinctInputTypes', function () {
    var Z = {
        name: 'Z',
        type: {
            name: 'Z',
            isInput: false,
            isEnum: false,
            isInterface: false,
            isObject: true,
            isScalar: false,
            isUnion: false,
        },
        fields: [],
        implements: null,
    };
    var typeMap = {
        A: {
            name: 'A',
            implements: null,
            type: {
                name: 'A',
                isInput: true,
                isEnum: false,
                isInterface: false,
                isObject: false,
                isScalar: false,
                isUnion: false,
            },
            fields: [
                {
                    name: 'b',
                    arguments: [],
                    type: {
                        name: 'B',
                        isInput: true,
                        isEnum: false,
                        isInterface: false,
                        isObject: false,
                        isScalar: false,
                        isUnion: false,
                        isRequired: false,
                        isArray: false,
                        isArrayRequired: false,
                    },
                },
                {
                    name: 'c',
                    arguments: [],
                    type: {
                        name: 'C',
                        isInput: true,
                        isEnum: false,
                        isInterface: false,
                        isObject: false,
                        isScalar: false,
                        isUnion: false,
                        isRequired: false,
                        isArray: false,
                        isArrayRequired: false,
                    },
                },
            ],
        },
        B: {
            name: 'B',
            implements: null,
            type: {
                name: 'B',
                isInput: true,
                isEnum: false,
                isInterface: false,
                isObject: false,
                isScalar: false,
                isUnion: false,
            },
            fields: [
                {
                    name: 'd',
                    arguments: [],
                    type: {
                        name: 'D',
                        isInput: true,
                        isEnum: false,
                        isInterface: false,
                        isObject: false,
                        isScalar: false,
                        isUnion: false,
                        isRequired: false,
                        isArray: false,
                        isArrayRequired: false,
                    },
                },
            ],
        },
        C: {
            name: 'C',
            implements: null,
            type: {
                name: 'C',
                isInput: true,
                isEnum: false,
                isInterface: false,
                isObject: false,
                isScalar: false,
                isUnion: false,
            },
            fields: [
                {
                    name: 'd',
                    arguments: [],
                    type: {
                        name: 'D',
                        isInput: true,
                        isEnum: false,
                        isInterface: false,
                        isObject: false,
                        isScalar: false,
                        isUnion: false,
                        isRequired: false,
                        isArray: false,
                        isArrayRequired: false,
                    },
                },
            ],
        },
        D: {
            name: 'D',
            implements: null,
            type: {
                name: 'D',
                isInput: true,
                isEnum: false,
                isInterface: false,
                isObject: false,
                isScalar: false,
                isUnion: false,
            },
            fields: [
                {
                    name: 'foo',
                    arguments: [],
                    type: {
                        name: 'String',
                        isInput: false,
                        isEnum: false,
                        isInterface: false,
                        isObject: false,
                        isScalar: true,
                        isUnion: false,
                        isRequired: false,
                        isArray: false,
                        isArrayRequired: false,
                    },
                },
            ],
        },
    };
    expect(Common.getDistinctInputTypes(Z, { Z: ['A'] }, typeMap))
        .toMatchInlineSnapshot("\nArray [\n  \"A\",\n  \"B\",\n  \"C\",\n  \"D\",\n]\n");
});
//# sourceMappingURL=common.spec.js.map