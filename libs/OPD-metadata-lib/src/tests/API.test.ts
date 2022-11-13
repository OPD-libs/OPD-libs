import { App, DataWriteOptions, Plugin_2, TFile } from 'obsidian';
import {deleteFieldInTFile, doesFieldExistInTFile, getFieldFromTFile, insertFieldInTFile} from '../API';
import { stringifyFrontmatter } from '../ObsUtils';
import {OPDTraversalError} from "../Utils";

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
	beforeAll(() => {
		const mockMetadata: any = {};
		mockPlugin = { ...mockAppGenerator(sampleTFile, '', mockMetadata) } as unknown as Plugin_2;
		initialFrontmatter = { ...mockMetadata.frontmatter };
	});

	describe('insertFieldInTFile', () => {
		test('should create a field successfully', async () => {
			mockPlugin = { ...mockAppGenerator(sampleTFile, '', {}) } as unknown as Plugin_2;
			await insertFieldInTFile('newlyCreated', 'test', sampleTFile, mockPlugin);
			expect(modify).toHaveBeenCalledTimes(1);
			expect(mockPlugin.app.vault.cachedRead).toHaveBeenCalledTimes(1);
		});

		test.each`
			key
			${2}
			${'🎈'}
			${'field value'}
			${'field-value'}
			${'🎈🎃'}
			${''}
			${"\\''"}
			${'${console.log(lol)}'}
			${'??'}
			${'~+'}
			${'🛒'}
			${{}}
			${[]}
		`('should create a field named $key', async ({ key }) => {
			await insertFieldInTFile(key, 'test', sampleTFile, mockPlugin);

			expect(stringifyFrontmatter).toHaveBeenCalledTimes(1);
			expect(stringifyFrontmatter).toHaveBeenCalledWith({ ...initialFrontmatter, key: 'test' });
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
	});

	describe('insertFieldInTFile', () => {
		test.each`
			value                    | type
			${'test'}                | ${'string'}
			${32}                    | ${'number'}
			${4.17}                  | ${'decimal'}
			${null}                  | ${'null'}
			${undefined}             | ${'undefined'}
			${[]}                    | ${'array'}
			${['test']}              | ${'array'}
			${[32]}                  | ${'array'}
			${{}}                    | ${'object'}
			${{ key: 'value' }}      | ${'object'}
			${{ key: undefined }}    | ${'object'}
			${'🎈'}                  | ${'string'}
			${'🎈🎃'}                | ${'string'}
			${''}                    | ${'string'}
			${"\\''"}                | ${'string'}
			${'${console.log(lol)}'} | ${'string'}
			${'??'}                  | ${'string'}
			${'~+'}                  | ${'string'}
			${'🛒'}                  | ${'string'}
			${'{}'}                  | ${'string'}
			${'[]'}                  | ${'string'}
		`('should create a single $type field with value $value', async ({ value }) => {
			await insertFieldInTFile('newlyCreated', value, sampleTFile, mockPlugin);

			expect(stringifyFrontmatter).toHaveBeenCalledTimes(1);
			expect(stringifyFrontmatter).toHaveBeenCalledWith({ ...initialFrontmatter, newlyCreated: value });
		});
	});

	describe('deleteFieldFromTFile', () => {
		test.each`
			key                    	
			${'title'}
		`('should successfully delete a valid key', async ({ key }) => {
			await deleteFieldInTFile(key, sampleTFile, mockPlugin);

			expect(stringifyFrontmatter).toHaveBeenCalledTimes(1);
			expect(stringifyFrontmatter).toHaveBeenCalledWith({});
		});

		test.each`
			key                    	
			${'title'}
			// ${'title.foo'}
		`('should fail when trying to delete a valid key twice', async ({ key }) => {
			await deleteFieldInTFile(key, sampleTFile, mockPlugin);
			await expect(async () => await deleteFieldInTFile(key, sampleTFile, mockPlugin)).rejects.toThrowError();

			expect(stringifyFrontmatter).toHaveBeenCalledTimes(1);
			expect(stringifyFrontmatter).toHaveBeenCalledWith({});
		});
	});

	describe('doesFieldExistInTFile', () => {
		test.each`
			key                    	
			${'title'}
		`('should return true if field exists in TFile', async ({ key }) => {
			expect(doesFieldExistInTFile(key, sampleTFile, mockPlugin)).toEqual(true);
		});

		test.each`
			key                    	
			${'Title'}
			${'title.foo'}
			${'foo'}
			${null}                  
			${undefined}             
			${"foo['bar'].baz[0]"}                  
		`('should return false when trying using non-existent key', async ({ key }) => {
			expect(doesFieldExistInTFile(key, sampleTFile, mockPlugin)).toEqual(false);
		});

		test.each`
			key                    	
			${'title?.nonexistent'}
		`('should throw OPDTraversal error for an invalid path', async ({ key }) => {
			expect(() => doesFieldExistInTFile(key, sampleTFile, mockPlugin)).toThrow(OPDTraversalError);
		});
	});

	describe('getFieldFromTFile', () => {
		test.each`
			key                    	
			${'title'}
		`('should return correct value if field exists in TFile', async ({key}) => {
			expect(getFieldFromTFile(key, sampleTFile, mockPlugin)).toEqual('Kimi no Na wa.');
		});

		test.each`
			key                    	
			${'Title'}
			${'title.foo'}
			${"foo['bar'].baz[0]"}                  
		`("should return undefined when the key doesn't exist", async ({key}) => {
			expect(getFieldFromTFile(key, sampleTFile, mockPlugin)).toBeUndefined();
		});

		test.each`
			key                    	
			${'title?.nonexistent'}
		`('should throw OPDTraversal error for an invalid path', async ({key}) => {
			expect(() => getFieldFromTFile(key, sampleTFile, mockPlugin)).toThrow(OPDTraversalError);
		});
	});
});
