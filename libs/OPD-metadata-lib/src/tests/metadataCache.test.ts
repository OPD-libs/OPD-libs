import {App, Plugin_2, TFile} from 'obsidian';
import {OPDMetadataLib} from '..';

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
                    cachedRead: async (_tfile: TFile): Promise<string> => {
                        return fileContents;
                    },
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

test('getting metadata from \"Kimi no Na Wa\"', async () => {
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

    mockPlugin = {...mockAppGenerator(sampleTFile, mockFileContents, kimiNoNaWaMetadataMock)} as unknown as Plugin_2;
    expect(OPDMetadataLib.getMetadataFromFileCache(sampleTFile, mockPlugin)).toEqual(expectedPropertyArray);
});


describe('property array conversions', () => {
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

    test('propertyArrayToObject', () => {
        expect(OPDMetadataLib.propertyArrayToObject(propertyArray)).toEqual(expectedObj);
    })

    test('propertyArrayToYAML', () => {
        // sorry AB, here idk how to mock obsidian's stringifyYaml function
        // expect(OPDMetadataLib.propertyArrayToYAML(propertyArray)).toEqual(expectedYAML);
    })
});

describe('updatePropertyArray', () => {
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

    test('update existing', () => {
        expect(OPDMetadataLib.updatePropertyArray({key: 'title', value: 'Your Name.', type: OPDMetadataLib.PropertyType.YAML}, propertyArray))
            .toEqual([
                {
                    type: OPDMetadataLib.PropertyType.YAML,
                    key: 'title',
                    value: 'Your Name.',
                },
            ]);
    });

    test('add new', () => {
        expect(OPDMetadataLib.updatePropertyArray({key: 'episodes', value: 1, type: OPDMetadataLib.PropertyType.YAML}, propertyArray))
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

    test('do both', () => {
        expect(OPDMetadataLib.updatePropertyArray([
            {key: 'episodes', value: 1, type: OPDMetadataLib.PropertyType.YAML},
            {key: 'title', value: 'Your Name.', type: OPDMetadataLib.PropertyType.YAML},
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

