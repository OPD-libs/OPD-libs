import { FrontMatterCache, Plugin_2, TFile } from 'obsidian';
import { Internal } from './Internal';
import { stringifyFrontmatter } from './ObsUtils';

/**
 * Checks whether a field exists inside  a files' metadata.
 *
 * @param field
 * @param file
 * @param plugin
 * @param isInline unused for now
 */
export function doesFieldExistInTFile(field: string, file: TFile, plugin: Plugin_2, isInline: boolean = false): boolean {
	const metadata = Internal.getMetadataFromFileCache(file, plugin);
	return Internal.hasField(field, metadata);
}

export function getFieldFromTFile(field: string, file: TFile, plugin: Plugin_2, isInline: boolean = false): any {
	const metadata = Internal.getMetadataFromFileCache(file, plugin);
	return Internal.getField(field, metadata);
}

export async function insertFieldInTFile(field: string, value: any, file: TFile, plugin: Plugin_2, isInline: boolean = false): Promise<void> {
	const metadata = Internal.getMetadataFromFileCache(file, plugin);
	Internal.insertField(field, value, metadata);
	await Internal.updateFrontmatter(metadata, file, plugin);
}

export async function updateFieldInTFile(field: string, value: any, file: TFile, plugin: Plugin_2, isInline: boolean = false): Promise<void> {
	const metadata = Internal.getMetadataFromFileCache(file, plugin);
	Internal.updateField(field, value, metadata);
	await Internal.updateFrontmatter(metadata, file, plugin);
}

export async function updateOrInsertFieldInTFile(field: string, value: any, file: TFile, plugin: Plugin_2, isInline: boolean = false): Promise<void> {
	let metadata = Internal.getMetadataFromFileCache(file, plugin);
	Internal.updateOrInsertField(field, value, metadata);
	await Internal.updateFrontmatter(metadata, file, plugin);
}

export async function deleteFieldInTFile(field: string, value: any, file: TFile, plugin: Plugin_2, isInline: boolean = false): Promise<void> {
	const metadata = Internal.getMetadataFromFileCache(file, plugin);
	Internal.deleteField(field, metadata);
	await Internal.updateFrontmatter(metadata, file, plugin);
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
		frontmatter = { [field]: value } as unknown as FrontMatterCache;
	}
	return frontmatter;
}

export async function createFieldInTFile(field: string, value: any, file: TFile, plugin: Plugin_2, isInline: boolean = false): Promise<void> {
	let frontmatter = updateParsedFrontmatter(plugin, file, field, value);
	const updatedYaml = stringifyFrontmatter(frontmatter);
	let fileContents = await generateFileContents(plugin, file, updatedYaml);
	await plugin.app.vault.modify(file, fileContents);
}
