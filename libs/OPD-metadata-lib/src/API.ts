import { FrontMatterCache, Plugin_2, TFile } from 'obsidian';
import { Internal } from './Internal';
import { stringifyFrontmatter } from './ObsUtils';

/**
 * Checks whether a field exists inside a files' metadata.
 * Note, when the field exists but the value is `undefined`, the method will return false.
 *
 * @throws OPDTraversalError if field is an invalid path to a metadata field.
 *
 * @param field The field to find, this can also be a path to a nested object e.g. `foo.bar`,
 * 				a path to a specific index in an array e.g. `foo[0]`
 * 				or any combination of those e.g. `foo['bar'].baz[0]`,
 * 				like you are used to from javascript, except that the `?` operator is **not** supported.
 * @param file
 * @param plugin
 * @param isInline unused for now
 *
 * @returns `true` if the field exists, `false` otherwise
 */
export function doesFieldExistInTFile(field: string, file: TFile, plugin: Plugin_2, isInline: boolean = false): boolean {
	const metadata = Internal.getMetadataFromFileCache(file, plugin);
	return Internal.hasField(field, metadata);
}

/**
 * Returns the value of a field in a files' metadata.
 * If the field does not exist, this method will return `undefined`.
 *
 * @throws OPDTraversalError if field is an invalid path to a metadata field.
 *
 * @param field The field to get, this can also be a path to a nested object e.g. `foo.bar`,
 * 				a path to a specific index in an array e.g. `foo[0]`
 * 				or any combination of those e.g. `foo['bar'].baz[0]`,
 * 				like you are used to from javascript, except that the `?` operator is **not** supported.
 * @param file
 * @param plugin
 * @param isInline unused for now
 *
 * @returns The value of the field or `undefined` if the field does not exist.
 */
export function getFieldFromTFile(field: string, file: TFile, plugin: Plugin_2, isInline: boolean = false): any {
	const metadata = Internal.getMetadataFromFileCache(file, plugin);
	return Internal.getField(field, metadata);
}

/**
 * Inserts a field in a files' metadata. If the field already exists, this method will throw.
 *
 * @throws Error If the field already exists.
 * @throws Error If the parent of the field to update/insert does not exist,
 * 		   e.g. if the method is called with the field `foo.bar`, but `foo` does not exist in the metadata this method will throw.
 * @throws OPDTraversalError If field is an invalid path to a metadata field.
 *
 * @param field The field to insert, this can also be a path to a nested object e.g. `foo.bar`,
 * 				a path to a specific index in an array e.g. `foo[0]`
 * 				or any combination of those e.g. `foo['bar'].baz[0]`,
 * 				like you are used to from javascript, except that the `?` operator is **not** supported.
 * @param value The new value of the field.
 * @param file
 * @param plugin
 * @param isInline unused for now
 */
export async function insertFieldInTFile(field: string, value: any, file: TFile, plugin: Plugin_2, isInline: boolean = false): Promise<void> {
	const metadata = Internal.getMetadataFromFileCache(file, plugin);
	Internal.insertField(field, value, metadata);
	await Internal.updateFrontmatter(metadata, file, plugin);
}

/**
 * Updates a field in a files' metadata. If the field does not exist, this method will throw.
 *
 * @throws Error If the field does not exist.
 * @throws Error If the parent of the field to update/insert does not exist,
 * 		   e.g. if the method is called with the field `foo.bar`, but `foo` does not exist in the metadata this method will throw.
 * @throws OPDTraversalError If field is an invalid path to a metadata field.
 *
 * @param field The field to update, this can also be a path to a nested object e.g. `foo.bar`,
 * 				a path to a specific index in an array e.g. `foo[0]`
 * 				or any combination of those e.g. `foo['bar'].baz[0]`,
 * 				like you are used to from javascript, except that the `?` operator is **not** supported.
 * @param value The new value of the field.
 * @param file
 * @param plugin
 * @param isInline unused for now
 */
export async function updateFieldInTFile(field: string, value: any, file: TFile, plugin: Plugin_2, isInline: boolean = false): Promise<void> {
	const metadata = Internal.getMetadataFromFileCache(file, plugin);
	Internal.updateField(field, value, metadata);
	await Internal.updateFrontmatter(metadata, file, plugin);
}

/**
 * Inserts or updates a field in a files' metadata.
 * This is more efficient than checking yourself with {@link doesFieldExistInTFile} and then inserting with {@link insertFieldInTFile} or updating with {@link updateFieldInTFile}.
 *
 * @throws Error If the parent of the field to update/insert does not exist,
 * 		   e.g. if the method is called with the field `foo.bar`, but `foo` does not exist in the metadata this method will throw.
 * @throws OPDTraversalError If field is an invalid path to a metadata field.
 *
 * @param field The field to update/insert, this can also be a path to a nested object e.g. `foo.bar`,
 * 				a path to a specific index in an array e.g. `foo[0]`
 * 				or any combination of those e.g. `foo['bar'].baz[0]`,
 * 				like you are used to from javascript, except that the `?` operator is **not** supported.
 * @param value The new value of the field.
 * @param file
 * @param plugin
 * @param isInline unused for now
 */
export async function updateOrInsertFieldInTFile(field: string, value: any, file: TFile, plugin: Plugin_2, isInline: boolean = false): Promise<void> {
	let metadata = Internal.getMetadataFromFileCache(file, plugin);
	Internal.updateOrInsertField(field, value, metadata);
	await Internal.updateFrontmatter(metadata, file, plugin);
}

/**
 * Deletes a field in a files' metadata.
 *
 * @throws Error If the parent of the field to update/insert does not exist,
 * 		   e.g. if the method is called with the field `foo.bar`, but `foo` does not exist in the metadata this method will throw.
 * @throws OPDTraversalError If field is an invalid path to a metadata field.
 *
 * @param field The field to delete, this can also be a path to a nested object e.g. `foo.bar`,
 * 				a path to a specific index in an array e.g. `foo[0]`
 * 				or any combination of those e.g. `foo['bar'].baz[0]`,
 * 				like you are used to from javascript, except that the `?` operator is **not** supported.
 * @param file
 * @param plugin
 * @param isInline unused for now
 */
export async function deleteFieldInTFile(field: string, file: TFile, plugin: Plugin_2, isInline: boolean = false): Promise<void> {
	const metadata = Internal.getMetadataFromFileCache(file, plugin);
	Internal.deleteField(field, metadata);
	await Internal.updateFrontmatter(metadata, file, plugin);
}

/**
 * Returns the frontmatter from a file.
 *
 * @param file
 * @param plugin
 */
export function getFrontmatterOfTFile(file: TFile, plugin: Plugin_2): object {
	return Internal.getMetadataFromFileCache(file, plugin);
}

/**
 * Updates the entire frontmatter of a file.
 *
 * @param metadata
 * @param file
 * @param plugin
 */
export async function setFrontmatterOfTFile(metadata: object, file: TFile, plugin: Plugin_2): Promise<void> {
	await Internal.updateFrontmatter(metadata, file, plugin);
}

/**
 * UNUSED
 * @deprecated
 *
 * @param plugin
 * @param file
 * @param frontmatterAsYaml
 */
async function generateFileContents(plugin: Plugin_2, file: TFile, frontmatterAsYaml: string) {
	const fileContents = await plugin.app.vault.cachedRead(file);
	return fileContents.replace(/^---\n(.*\n)*---/, frontmatterAsYaml);
}
