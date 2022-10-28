import { App, DataWriteOptions, Plugin_2, TFile } from 'obsidian';
import { insertFieldInTFile } from '../API';
import { stringifyFrontmatter } from '../ObsUtils';

jest.mock('../ObsUtils');
let mockPlugin: Plugin_2;
let mockAppGenerator: (tfile: TFile, fileContents: string, fileMetadata: any) => App;
const modify = jest.fn(async (file: TFile, contents: string, options?: DataWriteOptions | null) => {});
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

afterEach(() => {
	jest.clearAllMocks();
});

describe('When there is no metadata', () => {
	describe('addFieldInTFile', () => {
		test('should create a field successfully', async () => {
			mockPlugin = { ...mockAppGenerator(sampleTFile, '', {}) } as unknown as Plugin_2;
			await insertFieldInTFile('newlyCreated', 'test', sampleTFile, mockPlugin);
			expect(modify).toHaveBeenCalledTimes(1);
			expect(mockPlugin.app.vault.cachedRead).toHaveBeenCalledTimes(1);
		});
	});
});

describe('When there is a single field of metadata', () => {
	const mockMetadata: any = {
		frontmatter: {
			title: 'Kimi no Na wa.',
		},
	};
	mockPlugin = { ...mockAppGenerator(sampleTFile, '', mockMetadata) } as unknown as Plugin_2;
	const initialFrontmatter = { ...mockMetadata.frontmatter };

	describe('insertFieldInTFile', () => {
		const testInputs = ['test', null];

		test.each(testInputs.map(t => [typeof t, t, { ...initialFrontmatter, newlyCreated: t }]))(
			'should create a single %s field with value %s',
			async (_type, _value, expectedFrontmatter) => {
				await insertFieldInTFile('newlyCreated', expectedFrontmatter.newlyCreated, sampleTFile, mockPlugin);

				expect(stringifyFrontmatter).toHaveBeenCalledTimes(1);
				expect(stringifyFrontmatter).toHaveBeenCalledWith(expectedFrontmatter);
				expect(modify).toHaveBeenCalledTimes(1);
				expect(mockPlugin.app.vault.cachedRead).toHaveBeenCalledTimes(1);
			}
		);
	});
});
