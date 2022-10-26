import { parseYaml, Plugin_2, TFile } from 'obsidian';
import { parsePath, traverseObject, traverseObjectByPath, traverseObjectToParent } from './Utils';
import { stringifyFrontmatter } from './ObsUtils';

export namespace Internal {
	/**
	 * Regex Expression to match the markdown frontmatter block.
	 */
	export const frontMatterRexExpPattern: string = '^(---)\\n[\\s\\S]*?\\n---';

	/**
	 * Gets the metadata object from the file contents using regEx.
	 * If possible use {@link getMetadataFromFileCache}.
	 *
	 * @param fileContent the file content to read the metadata from
	 *
	 * @returns the frontmatter as a property array
	 */
	export function getMetaDataFromFileContent(fileContent: string): object {
		const regExp = new RegExp(frontMatterRexExpPattern);
		const frontMatterRegExpResult = regExp.exec(fileContent);
		if (!frontMatterRegExpResult) {
			return [];
		}
		let frontMatter = frontMatterRegExpResult[0];
		if (!frontMatter) {
			return [];
		}
		frontMatter = frontMatter.substring(4);
		frontMatter = frontMatter.substring(0, frontMatter.length - 3);

		return getMetaDataFromYAML(frontMatter);
	}

	/**
	 * Parses a yaml object.
	 *
	 * @param yaml
	 *
	 * @returns the parsed yaml as an object
	 */
	export function getMetaDataFromYAML(yaml: string): object {
		if (!yaml) {
			return {};
		}

		const obj = parseYaml(yaml);
		if (!obj) {
			return {};
		}

		return obj;
	}

	/**
	 * Gets the medata object form obsidian file cache.
	 *
	 * @param file
	 *
	 * @param plugin
	 * @returns the metadata as an object
	 */
	export function getMetadataFromFileCache(file: TFile, plugin: Plugin_2): object {
		let metadata: any = plugin.app.metadataCache.getFileCache(file)?.frontmatter;

		if (metadata) {
			metadata = Object.assign({}, metadata); // copy
			delete metadata.position;
		} else {
			return {};
		}

		return metadata;
	}

	/**
	 * Removes the frontmatter block from a file.
	 *
	 * @param fileContent
	 */
	export function removeFrontmatter(fileContent: string): string {
		return fileContent.replace(new RegExp(frontMatterRexExpPattern), '');
	}

	/**
	 * Replaces the Frontmatter of a file with the metadata.
	 *
	 * @param metadata
	 * @param file the file to modify the frontmatter in
	 * @param plugin
	 */
	export async function updateFrontmatter(metadata: object, file: TFile, plugin: Plugin_2) {
		let fileContent: string = await plugin.app.vault.cachedRead(file);
		fileContent = removeFrontmatter(fileContent);
		fileContent = `${stringifyFrontmatter(metadata)}${fileContent}`;

		await plugin.app.vault.modify(file, fileContent);
	}

	/**
	 * Returns true if the object has the field.
	 *
	 * @param path
	 * @param metadata
	 */
	export function hasField(path: string, metadata: object): boolean {
		return getField(path, metadata) !== undefined;
	}

	/**
	 * Gets one field form an object.
	 *
	 * @param path
	 * @param metadata
	 */
	export function getField(path: string, metadata: object): any {
		return traverseObject(path, metadata);
	}

	/**
	 * Deletes one field from am object.
	 *
	 * @param path
	 * @param metadata
	 */
	export function deleteField(path: string, metadata: object): object {
		let { parent, child } = traverseObjectToParent(path, metadata);

		if (Array.isArray(parent)) {
			const index = Number.parseInt(child.key);
			if (Number.isNaN(index)) {
				return metadata;
			}
			parent.splice(index, 1);
		} else {
			delete parent.value[child.key];
		}

		return metadata;
	}

	/**
	 * Updates one field in an object.
	 *
	 * @param path
	 * @param value
	 * @param metadata
	 */
	export function updateField(path: string, value: any, metadata: object): any {
		let { parent, child } = traverseObjectToParent(path, metadata);

		if (parent === undefined) {
			throw Error(`The parent to "${path}" does not exist in Object, please create the parent first`);
		}

		if (child.value === undefined) {
			throw Error(`Field with key "${path}" does not exist in Object`);
		}

		parent.value[child.key] = value;

		return metadata;
	}

	/**
	 * Adds one field in an object.
	 *
	 * @param path
	 * @param value
	 * @param metadata
	 */
	export function addField(path: string, value: any, metadata: object): any {
		let { parent, child } = traverseObjectToParent(path, metadata);

		if (parent === undefined) {
			throw Error(`The parent to "${path}" does not exist in Object, please create the parent first`);
		}

		if (child.value !== undefined) {
			throw Error(`Field with key "${path}" does already exist in Object`);
		}

		parent.value[child.key] = value;

		return metadata;
	}

	/**
	 * Update or inserts one field in an object.
	 *
	 * @param path
	 * @param value
	 * @param metadata
	 */
	export function upsertField(path: string, value: any, metadata: object): any {
		let { parent, child } = traverseObjectToParent(path, metadata);

		if (parent === undefined) {
			throw Error(`The parent to "${path}" does not exist in Object, please create the parent first`);
		}

		parent.value[child.key] = value;

		return metadata;
	}
}
