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

	describe('insertFieldInTFile', () => {
		test('should create a single string field successfully', async () => {
			mockPlugin = { ...mockAppGenerator(sampleTFile, '', mockMetadata) } as unknown as Plugin_2;

			await insertFieldInTFile('newlyCreated', 'test', sampleTFile, mockPlugin);

			expect(stringifyFrontmatter).toHaveBeenCalledTimes(1);
			expect(stringifyFrontmatter).toHaveBeenCalledWith({
				title: 'Kimi no Na wa.',
				newlyCreated: 'test',
			});
			expect(modify).toHaveBeenCalledTimes(1);
			expect(mockPlugin.app.vault.cachedRead).toHaveBeenCalledTimes(1);
		});

		test('should create a null valued field successfully', async () => {
			mockPlugin = { ...mockAppGenerator(sampleTFile, '', mockMetadata) } as unknown as Plugin_2;
			const insertThis = { newlyCreated: null };

			await insertFieldInTFile(Object.keys(insertThis)[0], insertThis.newlyCreated, sampleTFile, mockPlugin);

			expect(stringifyFrontmatter).toHaveBeenCalledTimes(1);
			expect(stringifyFrontmatter).toHaveBeenCalledWith({
				title: 'Kimi no Na wa.',
				...insertThis,
			});
			expect(mockPlugin.app.vault.cachedRead).toHaveBeenCalledTimes(1);
		});
	});
});
