import { App, DataWriteOptions, Plugin_2, TFile  } from 'obsidian';
import { OPDMetadataLib } from '..';
import type { Vault } from 'obsidian';

let mockFileContents: string;
let mockPlugin: Plugin_2;
let mockAppGenerator: (tfile: TFile, fileContents: string, fileMetadata: any) => App;

beforeAll(() => {
    mockAppGenerator = (tfile: TFile, fileContents: string, fileMetadata: any) => {
        return {
            app: {
                vault: {
                    getAbstractFileByPath: (_path: string): TFile => {
                        return tfile;
                    },
                    cachedRead: async (_file: TFile): Promise<string> => {
                        return fileContents;
                    },
                    modify: async (_file: TFile, _data: string, _options?: DataWriteOptions): Promise<void> => {
                        jest.fn((_file, _data, _options) => Promise.resolve());
                    }
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

describe('test getMetadataFromFileCache', () => {
    test('should get metadata containing title from \"Kimi no Na Wa\" as property array', async () => {
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
        const kimiNoNaWaMetadataMock: any = {
            frontmatter: {
                title: 'Kimi no Na wa.',
            },
        };
        const expectedPropertyArray: OPDMetadataLib.Property[] = [
            {
                type: OPDMetadataLib.PropertyType.YAML,
                key: 'title',
                value: 'Kimi no Na wa.',
            },
        ];

        mockPlugin = { ...mockAppGenerator(sampleTFile, mockFileContents, kimiNoNaWaMetadataMock) } as unknown as Plugin_2;
        expect(OPDMetadataLib.getMetadataFromFileCache(sampleTFile, mockPlugin)).toEqual(expectedPropertyArray);
    });
});

describe('test property array conversions', () => {
    const propertyArray: OPDMetadataLib.Property[] = [
        {
            type: OPDMetadataLib.PropertyType.YAML,
            key: 'title',
            value: 'Kimi no Na wa.',
        },
        {
            type: OPDMetadataLib.PropertyType.YAML,
            key: 'episodes',
            value: 1,
        },
        {
            type: OPDMetadataLib.PropertyType.YAML,
            key: 'genres',
            value: ['Award Winning', 'Drama', 'Supernatural'],
        },
        {
            type: OPDMetadataLib.PropertyType.YAML,
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
        }
    }
    const expectedYAML = `title: Kimi no Na wa.
episodes: 1
genres:
  - Award Winning
  - Drama
  - Supernatural
statistics:
  score: 8.86
  ranked: 24
  popularity: 11`;

    test('convert to object - should convert the property array into an object', () => {
        expect(OPDMetadataLib.propertyArrayToObject(propertyArray)).toEqual(expectedObj);
    })

    test('convert to YAML - should convert the property array into YAML', () => {
        // sorry AB, here idk how to mock obsidian's stringifyYaml function
        // expect(OPDMetadataLib.propertyArrayToYAML(propertyArray)).toEqual(expectedYAML);
    })
});

describe('test updatePropertyArray', () => {
    let propertyArray: OPDMetadataLib.Property[];
    beforeEach(() => {
        propertyArray = [
            {
                type: OPDMetadataLib.PropertyType.YAML,
                key: 'title',
                value: 'Kimi no Na wa.',
            },
        ]
    });

    test('update existent property - should update the existing property', () => {
        expect(OPDMetadataLib.updatePropertyArray({ key: 'title', value: 'Your Name.', type: OPDMetadataLib.PropertyType.YAML }, propertyArray))
            .toEqual([
                {
                    type: OPDMetadataLib.PropertyType.YAML,
                    key: 'title',
                    value: 'Your Name.',
                },
            ]);
    });

    test('update non existent property - should add a new property', () => {
        expect(OPDMetadataLib.updatePropertyArray({ key: 'episodes', value: 1, type: OPDMetadataLib.PropertyType.YAML }, propertyArray))
            .toEqual([
                {
                    type: OPDMetadataLib.PropertyType.YAML,
                    key: 'title',
                    value: 'Kimi no Na wa.',
                },
                {
                    type: OPDMetadataLib.PropertyType.YAML,
                    key: 'episodes',
                    value: 1,
                },
            ]);
    });

    test('update multiple properties - should update one existing and one new property', () => {
        expect(OPDMetadataLib.updatePropertyArray([
            { key: 'episodes', value: 1, type: OPDMetadataLib.PropertyType.YAML },
            { key: 'title', value: 'Your Name.', type: OPDMetadataLib.PropertyType.YAML },
        ], propertyArray))
            .toEqual([
                {
                    type: OPDMetadataLib.PropertyType.YAML,
                    key: 'title',
                    value: 'Your Name.',
                },
                {
                    type: OPDMetadataLib.PropertyType.YAML,
                    key: 'episodes',
                    value: 1,
                },
            ]);
    });
});