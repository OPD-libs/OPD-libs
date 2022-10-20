import {parseYaml, Plugin_2, stringifyYaml, TFile} from 'obsidian';

export namespace OPDMetadataLib {
    /**
     * Regex Expression to match the markdown frontmatter block.
     */
    export const frontMatterRexExpPattern: string = '^(---)\\n[\\s\\S]*?\\n---';

	export interface Property {
		key: string,
		value: any,
		type: PropertyType,
	}

	export enum PropertyType {
		YAML = 'yaml',
		DATA_VIEW = 'data_view',
	}

	/**
	 * Gets the metadata object from the file contents using regEx.
	 * If possible use {@link getMetadataFromFileCache}.
	 *
	 * @param fileContent the file content to read the metadata from
	 *
	 * @returns the frontmatter as a property array
	 */
    export function getMetaDataFromFileContent(fileContent: string): Property[] {
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
	 * @returns the parsed yaml as a property array
	 */
	export function getMetaDataFromYAML(yaml: string): Property[] {
		if (!yaml) {
			return [];
		}

		const obj = parseYaml(yaml);
		if (!obj) {
			return [];
		}

		const properties: Property[] = [];
		for (const [key, value] of Object.entries(obj)) {
			properties.push({key, value, type: PropertyType.YAML});
		}

		return properties;
	}

	/**
	 * Gets the medata object form obsidian file cache.
	 *
	 * @param file
	 *
	 * @param plugin
	 * @returns the metadata as a property array
	 */
    export function getMetadataFromFileCache(file: TFile, plugin: Plugin_2): Property[] {
		let metadata: any = plugin.app.metadataCache.getFileCache(file)?.frontmatter;

		if (metadata) {
			metadata = Object.assign({}, metadata); // copy
			delete metadata.position;
		} else {
			return [];
		}

		const properties: Property[] = [];
		for (const [key, value] of Object.entries(metadata)) {
			properties.push({key, value, type: PropertyType.YAML});
		}

		return properties;
	}

	/**
	 * Updates one or more metadata fields.
	 * Currently only YAML properties are supported
	 *
	 * @param property
	 * @param file the file to modify the frontmatter in
	 * @param plugin
	 */
	export async function updateMetaDataProperty(property: Property|Property[], file: TFile, plugin: Plugin_2) {
		// make property always an array
		if (!Array.isArray(property)) {
			property = [property];
		}

		for (const property1 of property) {
			if (property1.type === PropertyType.YAML) {
				await updateFrontmatterProperty(property1, file, plugin);
				return;
			}
		}

	}

	/**
	 * Updates one or more frontmatter field(s) of a file.
	 *
	 * @param property
	 * @param file the file to modify the frontmatter in
	 * @param plugin
	 */
	export async function updateFrontmatterProperty(property: Property|Property[], file: TFile, plugin: Plugin_2) {
		let fileContent: string = await plugin.app.vault.read(file);
		let frontmatter: Property[] = getMetadataFromFileCache(file, plugin);

		frontmatter = updatePropertyArray(property, frontmatter);
		fileContent = removeFrontmatter(fileContent);
		fileContent = `---\n${propertyArrayToYAML(frontmatter)}---${fileContent}`;

		await plugin.app.vault.modify(file, fileContent);
	}

	/**
	 * Updates one or more properties in a property array.
	 * If a property is not contained within the property array, it will be added to the array.
	 *
	 * @param property the properties with updated values
	 * @param propertyArray
	 */
	export function updatePropertyArray(property: Property|Property[], propertyArray: Property[]): Property[] {
		// make property always an array
		if (!Array.isArray(property)) {
			property = [property];
		}

		propLoop : for (const property1 of property) {
			for (let i = 0; i < propertyArray.length; i++) {
				if (propertyArray[i].key === property1.key) {
					propertyArray[i] = property1;
					continue propLoop;
				}
			}
			propertyArray.push(property1);
		}

		return propertyArray;
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
	 * Converts a property array to an object.
	 *
	 * @param properties
	 */
	export function propertyArrayToObject(properties: Property[]): object {
		const obj: any = {};
		for (const property of properties) {
			if (property.type === PropertyType.YAML) {
				obj[property.key] = property.value;
			}
		}
		return obj;
	}

	/**
	 * Converts a property array to yaml.
	 *
	 * @param properties
	 */
	export function propertyArrayToYAML(properties: Property[]): string {
		return stringifyYaml(propertyArrayToObject(properties));
	}
}