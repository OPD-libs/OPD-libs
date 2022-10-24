import {parseYaml, Plugin_2, TFile} from 'obsidian';
import stringifyFrontmatter from './utils';

export namespace Internal {
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
     * Replaces the Frontmatter of a file with the propertyArray.
     *
     * @param propertyArray
     * @param file the file to modify the frontmatter in
     * @param plugin
     */
    export async function updateFrontmatter(propertyArray: Property[], file: TFile, plugin: Plugin_2) {
        let fileContent: string = await plugin.app.vault.cachedRead(file);
        fileContent = removeFrontmatter(fileContent);
        fileContent = `${propertyArrayToFrontmatter(propertyArray)}${fileContent}`;

        await plugin.app.vault.modify(file, fileContent);
    }


    export function hasProperty(propertyArray: Property[], key: string): boolean {
        return !!findProperty(propertyArray, key);
    }

    export function findProperty(propertyArray: Property[], key: string): any {
        return propertyArray.find(x => x.key == key);
    }

    export function deleteProperty(propertyArray: Property[], key: string): Property[] {
        return propertyArray.filter(x => x.key !== key);
    }

    /**
     * Updates one property in a property array.
     *
     * @param property the property with updated value
     * @param propertyArray
     */
    export function updatePropertyArray(propertyArray: Property[], property: Property): Property[] {

        for (let i = 0; i < propertyArray.length; i++) {
            if (propertyArray[i].key === property.key) {
                propertyArray[i] = property;
                return propertyArray;
            }
        }

        throw Error(`Property with key "${property.key}" does not exist in Object`);
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
    export function propertyArrayToFrontmatter(properties: Property[]): string {
        return stringifyFrontmatter(propertyArrayToObject(properties));
    }
}