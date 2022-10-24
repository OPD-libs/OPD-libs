import {App, DataWriteOptions, Plugin_2, TFile} from 'obsidian';
import stringifyFrontmatter from '../utils';
import {Internal} from '../Internal';
import {createFieldInTFile} from '../API';

jest.mock('../utils');
let mockFileContents: string = `---
title: Kimi no Na wa.
---`;
let mockPlugin: Plugin_2;
let mockAppGenerator: (tfile: TFile, fileContents: string, fileMetadata: any) => App;
const modify = jest.fn(async (file: TFile, contents: string, options?: DataWriteOptions | null) => {
});
const mockedFunc = stringifyFrontmatter as jest.Mock;
const sampleTFile = {
    path: 'Media DB/Kimi no Na wa (2016).md',
    name: 'Kimi no Na wa (2016).md',
    basename: 'Kimi no Na wa (2016)',
    extension: 'md',
    stat: {
        ctime: 1665233725400,
        mtime: 1665236198538,
        size: 475,
    },
} as TFile;
const mockMetadata: any = {
    frontmatter: {
        title: 'Kimi no Na wa.',
    },
};

beforeAll(() => {
    mockAppGenerator = (tfile: TFile, fileContents: string, fileMetadata: any) => {
        return {
            app: {
                vault: {
                    getAbstractFileByPath: (_path: string): TFile => {
                        return tfile;
                    },
                    cachedRead: jest.fn(async (_file: TFile): Promise<string> => await fileContents),
                    modify: modify,
                },
                metadataCache: {
                    getFileCache: (_tfile: TFile): any => {
                        return fileMetadata;
                    },
                },
            },
        } as unknown as App;
    };
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('test for internal methods', () => {
    describe('test getMetadataFromFileCache', () => {
        test('should get metadata containing title from \"Kimi no Na Wa\" as property array', async () => {
            const expectedPropertyArray: Internal.Property[] = [
                {
                    type: Internal.PropertyType.YAML,
                    key: 'title',
                    value: 'Kimi no Na wa.',
                },
            ];

            mockPlugin = {...mockAppGenerator(sampleTFile, mockFileContents, mockMetadata)} as unknown as Plugin_2;
            expect(Internal.getMetadataFromFileCache(sampleTFile, mockPlugin)).toEqual(expectedPropertyArray);
        });
    });

    describe('test property array conversions', () => {
        const propertyArray: Internal.Property[] = [
            {
                type: Internal.PropertyType.YAML,
                key: 'title',
                value: 'Kimi no Na wa.',
            },
            {
                type: Internal.PropertyType.YAML,
                key: 'episodes',
                value: 1,
            },
            {
                type: Internal.PropertyType.YAML,
                key: 'genres',
                value: ['Award Winning', 'Drama', 'Supernatural'],
            },
            {
                type: Internal.PropertyType.YAML,
                key: 'statistics',
                value: {
                    score: 8.86,
                    ranked: 24,
                    popularity: 11,
                },
            },
        ];
        const expectedObj: any = {
            title: 'Kimi no Na wa.',
            episodes: 1,
            genres: ['Award Winning', 'Drama', 'Supernatural'],
            statistics: {
                score: 8.86,
                ranked: 24,
                popularity: 11,
            },
        };

        test('convert to object - should convert the property array into an object', () => {
            expect(Internal.propertyArrayToObject(propertyArray)).toEqual(expectedObj);
        });

        test('convert to Frontmatter - should convert the property array into Frontmatter', () => {
            // sorry AB, here idk how to mock obsidian's stringifyYaml function
            // expect(OPDMetadataLib.propertyArrayToYAML(propertyArray)).toEqual(expectedYAML);
        });
    });

    describe('test updatePropertyArray', () => {
        let propertyArray: Internal.Property[];
        beforeEach(() => {
            propertyArray = [
                {
                    type: Internal.PropertyType.YAML,
                    key: 'title',
                    value: 'Kimi no Na wa.',
                },
            ];
        });

        test('update existent property - should update the existing property', () => {
            expect(Internal.updatePropertyArray(propertyArray, {key: 'title', value: 'Your Name.', type: Internal.PropertyType.YAML}))
                .toEqual([
                    {
                        type: Internal.PropertyType.YAML,
                        key: 'title',
                        value: 'Your Name.',
                    },
                ]);
        });

        test('update non existent property - should throw', () => {
            expect(() => Internal.updatePropertyArray(propertyArray, {key: 'episodes', value: 1, type: Internal.PropertyType.YAML}))
                .toThrow();
        });
    });
});

describe('createFieldInTFile', () => {
    test('should successfully create field when it doesn\'t exist', async () => {
        mockedFunc.mockImplementation((_obj: any) => '---\ntitle: Kimi no Na wa.\nnewlyCreated: test\n---');
        mockPlugin = {...mockAppGenerator(sampleTFile, mockFileContents, mockMetadata)} as unknown as Plugin_2;
        await createFieldInTFile('newlyCreated', 'test', sampleTFile, mockPlugin);
        expect(modify).toHaveBeenCalledWith(sampleTFile, '---\ntitle: Kimi no Na wa.\nnewlyCreated: test\n---');
        expect(mockPlugin.app.vault.cachedRead).toHaveBeenCalledTimes(1);
    });
});