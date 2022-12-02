/**
 * Gets the file name from a path.
 * The Path must be separated by `/`.
 *
 * @param path the path, must be seperated by `/`
 *
 * @returns the file name including the file extension if it was present
 */
export function getFileName(path: string): string {
	return path.split('/').at(-1) ?? path;
}

/**
 * Checks if a path is a path or a file name.
 * The Path must be separated by `/`.
 *
 * @param path the path, must be seperated by `/`
 *
 * @returns `true` if the path is a path, `false` if it is a file name
 */
export function isPath(path: string): boolean {
	return path.split('/').length > 1;
}

/**
 * Removes the file extension of a file name.
 *
 * @param fileName the file name
 *
 * @returns the file name without the file extension
 */
export function removeFileExtension(fileName: string): string {
	const fileNameParts = fileName.split('.');
	if (fileNameParts.length === 1) {
		return fileName;
	} else {
		let newFileName = fileNameParts[0];
		for (let i = 1; i < fileNameParts.length - 1; i++) {
			newFileName += '.' + fileNameParts[i];
		}
		return newFileName;
	}
}

/**
 * Clamp a number between a min and a max.
 *
 * @param num the number to clamp
 * @param min the minimum value
 * @param max the maximum value
 *
 * @returns `min` if `num < min`, `max` if `num > max`, `num` else
 */
export function clamp(num: number, min: number, max: number): number {
	return Math.min(Math.max(num, min), max);
}

/**
 * Mathematically correct modulo.
 *
 * @param n
 * @param m
 *
 * @returns `n % m` always in the range `0..m-1`
 */
export function mod(n: number, m: number): number {
	return ((n % m) + m) % m;
}

/**
 * Checks if 2 arrays are equal, the arrays should have the same datatype
 *
 * @param arr1
 * @param arr2
 *
 * @returns true if the two arrays are equal
 */
export function arrayEquals<T>(arr1: T[], arr2: T[]): boolean {
	if (arr1.length !== arr2.length) {
		return false;
	}

	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) {
			return false;
		}
	}

	return true;
}

/**
 * Checks if a value is truthy.
 *
 * @param value
 *
 * @returns true if the value is truthy
 */
export function isTruthy(value: any): boolean {
	return !!value;
}

/**
 * Checks if a value is falsy.
 *
 * @param value
 *
 * @returns true if the value is falsy
 */
export function isFalsy(value: any): boolean {
	return !value;
}

/**
 * Checks if two strings are equal or one includes the other.
 *
 * @param str1
 * @param str1
 *
 * @returns true if `str1` and `str2` are equal or one includes the other
 */
export function equalOrIncludes(str1: string, str2: string): boolean {
	return str1 === str2 || str1.includes(str2) || str2.includes(str1);
}

/**
 * Converts a number to a string.
 *
 * @param n
 *
 * @returns `n` as a string
 */
export function numberToString(n: number | string): string {
	return n + '';
}

export interface KeyValuePair<T, U> {
	key: T;
	value: U;
}
