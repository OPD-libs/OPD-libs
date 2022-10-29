import { App, DataWriteOptions, Plugin_2, TFile } from 'obsidian';
import { insertFieldInTFile } from '../API';
import { stringifyFrontmatter } from '../ObsUtils';

jest.mock('../ObsUtils');
let mockPlugin: Plugin_2;
let mockAppGenerator: (tfile: TFile, fileContents: string, fileMetadata: any) => App;
const modify = jest.fn(async (file: TFile, contents: string, options?: DataWriteOptions | null) => { });
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
let initialFrontmatter: any;

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
	beforeAll(() => {
		const mockMetadata: any = {
			frontmatter: {
				title: 'Kimi no Na wa.',
			},
		};
		mockPlugin = { ...mockAppGenerator(sampleTFile, '', mockMetadata) } as unknown as Plugin_2;
		initialFrontmatter = { ...mockMetadata.frontmatter };
	})

	describe('insertFieldInTFile', () => {
		test.each`
			value					| type 
			${'test'} 				| ${'string'}
			${32}					| ${'number'}
			${ 4.17}				| ${'decimal'}
			${ null}				| ${'null'}
			${ undefined}			| ${'undefined'}
			${ []}					| ${'array'}
			${ ["test"]}			| ${'array'}
			${ [32]}				| ${'array'}
			${{}}					| ${'object'}
			${{ key: "value" }}		| ${'object'}
			${{ key: undefined }}	| ${'object'}
		`
		(
			'should create a single $type field with value $value',
			async ({ value} ) => {
				await insertFieldInTFile('newlyCreated', value, sampleTFile, mockPlugin);

				expect(stringifyFrontmatter).toHaveBeenCalledTimes(1);
				expect(stringifyFrontmatter).toHaveBeenCalledWith({...initialFrontmatter, newlyCreated: value});
				expect(modify).toHaveBeenCalledTimes(1);
				expect(mockPlugin.app.vault.cachedRead).toHaveBeenCalledTimes(1);
			}
		);
	});
});
