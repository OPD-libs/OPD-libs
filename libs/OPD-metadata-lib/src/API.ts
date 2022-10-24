import {FrontMatterCache, Plugin_2, TFile} from 'obsidian';
import {Internal} from './Internal';
import stringifyFrontmatter from './utils';

/**
 * Checks whether a field exists inside  a files' metadata.
 *
 * @param field
 * @param file
 * @param plugin
 * @param isInline unused for now
 */
export function doesFieldExistInTFile(field: string, file: TFile, plugin: Plugin_2, isInline: boolean = false): boolean {
    const propertyArray = Internal.getMetadataFromFileCache(file, plugin);
    return Internal.hasProperty(propertyArray, field);
}

export function getFieldFromTFile(field: string, file: TFile, plugin: Plugin_2, isInline: boolean = false): any {
    const propertyArray = Internal.getMetadataFromFileCache(file, plugin);
    return Internal.findProperty(propertyArray, field);
}

export async function addFieldInTFile(field: string, value: any, file: TFile, plugin: Plugin_2, isInline: boolean = false): Promise<void> {
    const propertyArray = Internal.getMetadataFromFileCache(file, plugin);
    propertyArray.push({key: field, value: value, type: Internal.PropertyType.YAML});
    await Internal.updateFrontmatter(propertyArray, file, plugin);
}

export async function updateFieldInTFile(field: string, value: any, file: TFile, plugin: Plugin_2, isInline: boolean = false): Promise<void> {
    const propertyArray = Internal.getMetadataFromFileCache(file, plugin);
    const updatedPropertyArray = Internal.updatePropertyArray(propertyArray, {key: field, value: value, type: Internal.PropertyType.YAML});
    await Internal.updateFrontmatter(updatedPropertyArray, file, plugin);
}

export async function upsertFieldInTFile(field: string, value: any, file: TFile, plugin: Plugin_2, isInline: boolean = false): Promise<void> {
    let propertyArray = Internal.getMetadataFromFileCache(file, plugin);

    if (Internal.hasProperty(propertyArray, field)) {
        propertyArray = Internal.updatePropertyArray(propertyArray, {key: field, value: value, type: Internal.PropertyType.YAML});
    } else {
        propertyArray.push({key: field, value: value, type: Internal.PropertyType.YAML});
    }

    await Internal.updateFrontmatter(propertyArray, file, plugin);
}

export async function deleteFieldInTFile(field: string, value: any, file: TFile, plugin: Plugin_2, isInline: boolean = false): Promise<void> {
    const propertyArray = Internal.getMetadataFromFileCache(file, plugin);
    const updatedPropertyArray = Internal.deleteProperty(propertyArray, field);
    await Internal.updateFrontmatter(updatedPropertyArray, file, plugin);
}


async function generateFileContents(plugin: Plugin_2, file: TFile, frontmatterAsYaml: string) {
    const fileContents = await plugin.app.vault.cachedRead(file);
    return fileContents.replace(/^---\n(.*\n)*---/, frontmatterAsYaml);
}

function updateParsedFrontmatter(plugin: Plugin_2, file: TFile, field: string, value: any): FrontMatterCache {
    let frontmatter: FrontMatterCache | undefined = plugin.app.metadataCache.getFileCache(file)?.frontmatter;
    if (frontmatter) {
        frontmatter[field] = value;
    } else {
        frontmatter = {[field]: value} as unknown as FrontMatterCache;
    }
    return frontmatter;
}

export async function createFieldInTFile(field: string, value: any, file: TFile, plugin: Plugin_2, isInline: boolean = false): Promise<void> {
    let frontmatter = updateParsedFrontmatter(plugin, file, field, value);
    const updatedYaml = stringifyFrontmatter(frontmatter);
    let fileContents = await generateFileContents(plugin, file, updatedYaml);
    await plugin.app.vault.modify(file, fileContents);
}