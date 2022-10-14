import {parseYaml, TFile} from 'obsidian';

export namespace OPDMetadataLib {
    /**
     * Regex Expression to match the markdown frontmatter block.
     */
    export const frontMatterRexExpPattern: string = '^(---)\\n[\\s\\S]*?\\n---';

	/**
	 * Gets the metadata object from the file contents using regEx.
	 * If possible use {@link getMetadataFromFileCache}.
	 *
	 * @param fileContent the file content to read the metadata from
	 */
    export function getMetaDataFromFileContent(fileContent: string): object {
		let metadata: any;

		const regExp = new RegExp(frontMatterRexExpPattern);
		const frontMatterRegExpResult = regExp.exec(fileContent);
		if (!frontMatterRegExpResult) {
			return {};
		}
		let frontMatter = frontMatterRegExpResult[0];
		if (!frontMatter) {
			return {};
		}
		frontMatter = frontMatter.substring(4);
		frontMatter = frontMatter.substring(0, frontMatter.length - 3);

		metadata = parseYaml(frontMatter);

		if (!metadata) {
			metadata = {};
		}

		return metadata;
	}

	/**
	 * Gets the medata object form obsidian file cache.
	 *
	 * @param file
	 */
    export function getMetadataFromFileCache(file: TFile): object {
		let metadata: any = app.metadataCache.getFileCache(file)?.frontmatter;

		if (metadata) {
			metadata = Object.assign({}, metadata); // copy
			delete metadata.position;
		} else {
			metadata = {};
		}

		return metadata;
	}
}