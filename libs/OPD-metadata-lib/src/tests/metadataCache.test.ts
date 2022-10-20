import { Plugin_2, TFile } from 'obsidian';
import { App } from 'obsidian';
import { OPDMetadataLib } from '..';

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
                    cachedRead: async (_tfile: TFile): Promise<string> => { return fileContents; }
                },
                metadataCache: {
                    getFileCache: (_tfile: TFile): any => { return fileMetadata; }
                }
            }
        } as unknown as App;
    }
})

test('getting metadata from Kimi no Na Wa', async () => {
    const sampleTFile = {
        "path": "Media DB/Kimi no Na wa (2016).md",
        "name": "Kimi no Na wa (2016).md",
        "basename": "Kimi no Na wa (2016)",
        "extension": "md",
        "stat": {
            "ctime": 1665233725400,
            "mtime": 1665236198538,
            "size": 475
        }
    } as TFile;
    let kimiNoNaWaMetadataMock: any = {
        "frontmatter": {
            "title": "Kimi no Na wa.",
        }
    };
    mockPlugin = { ...mockAppGenerator(sampleTFile, mockFileContents, kimiNoNaWaMetadataMock) } as unknown as Plugin_2;
    expect(OPDMetadataLib.getMetadataFromFileCache(sampleTFile, mockPlugin, "title")).toBe("Kimi no Na Wa.");
})
