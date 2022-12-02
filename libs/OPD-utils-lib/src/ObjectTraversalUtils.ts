import { KeyValuePair } from './Utils';
import { OPDUtilsObjectTraversalError } from './Errors';

/**
 * Traverses an object along a path.
 *
 * @param path The path to traverse the object along. This can be a path like `foo.bar`,
 * 				a path to a specific index in an array e.g. `foo[0]`
 * 				or any combination of those e.g. `foo['bar'].baz[0]`.
 * 				Like the javascript notation, except that the `?` operator is **not** supported.
 * @param o the object to traverse
 *
 * @returns the value at the end of the path or `undefined` if the value does not exist
 */
export function traverseObject(path: string, o: any): any {
	let pathParts: string[] = parsePath(path);
	return traverseObjectByPath(pathParts, o);
}

/**
 * Traverses an object along a path to the parent object of the path.
 *
 * @throws OPDUtilsObjectTraversalError if the path is empty
 *
 * @param path The path to traverse the object along. This can be a path like `foo.bar`,
 * 				a path to a specific index in an array e.g. `foo[0]`
 * 				or any combination of those e.g. `foo['bar'].baz[0]`.
 * 				Like the javascript notation, except that the `?` operator is **not** supported.
 * @param o the object to traverse
 *
 * @returns the parent as well as the parsed path to reach the parent and the child as well as the key for the child
 */
export function traverseObjectToParent(path: string, o: any): { parent: KeyValuePair<string[], any>; child: KeyValuePair<string, any> } {
	let pathParts: string[] = parsePath(path);

	if (pathParts[0] === '') {
		throw new OPDUtilsObjectTraversalError('can not traverse to parent on self reference');
	}

	let parentPath = pathParts.slice(0, -1);
	let childKey: string = pathParts.at(-1) ?? '';
	let parentObject = traverseObjectByPath(parentPath, o);

	return {
		parent: { key: parentPath, value: parentObject },
		child: { key: childKey, value: parentObject[childKey] },
	};
}

/**
 * Traverses an object along a parsed.
 *
 * @param pathParts The path to traverse the object along. This can be a path like `['foo', 'bar']`
 * @param o the object to traverse
 *
 * @returns the value at the end of the path or `undefined` if the value does not exist
 */
export function traverseObjectByPath(pathParts: string[], o: any): any {
	for (const pathPart of pathParts) {
		if (pathPart === '') {
			return o;
		}
		if (o === undefined) {
			return undefined;
		}
		o = o[pathPart];
	}

	return o;
}

/**
 * Parses an object traversal path.
 *
 * @param path The path to traverse the object along. This can be a path like `foo.bar`,
 * 				a path to a specific index in an array e.g. `foo[0]`
 * 				or any combination of those e.g. `foo['bar'].baz[0]`.
 * 				Like the javascript notation, except that the `?` operator is **not** supported.
 *
 * @returns the path as an array of its parts
 */
export function parsePath(path: string): string[] {
	path = path.replace(/'/g, '"');
	validatePath(path);
	return path
		.split('.')
		.map(x =>
			x.split('[').map(y => {
				if (y.endsWith(']')) {
					y = y.slice(0, -1);
				}
				if (y.startsWith('"') && y.endsWith('"')) {
					y = y.slice(1, -1);
				}
				return y;
			})
		)
		.flat();
}

/**
 * Validates an object traversal path.
 *
 * @throws OPDUtilsObjectTraversalError if the path is invalid
 *
 * @param path The path to traverse the object along. This can be a path like `foo.bar`,
 * 				a path to a specific index in an array e.g. `foo[0]`
 * 				or any combination of those e.g. `foo['bar'].baz[0]`.
 * 				Like the javascript notation, except that the `?` operator is **not** supported.
 */
export function validatePath(path: string): void {
	const numbers = '0123456789';
	const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

	let insideStringBrackets: boolean = false;
	let insideNumberBrackets: boolean = false;

	for (let i = 0; i < path.length; i++) {
		const char = path[i];
		const nextChar = path[i + 1];

		// if char is a dot
		if (char === '.') {
			// a dot may not be at the beginning of a path
			if (i === 0) {
				throw new OPDUtilsObjectTraversalError(`Invalid character '${char}' at position ${i} in "${path}", path may not start with '.'`);
			}

			// the thing following a dot must be a valid variable name, so it must start with a letter or an underscore
			if (!(letters.includes(nextChar) || nextChar === '_' || nextChar === '$')) {
				throw new OPDUtilsObjectTraversalError(`Invalid character '${nextChar}' at position ${i + 1} in "${path}", expected a letter, '_' or '$' to follow '.'`);
			}
		}

		// bracket enter condition
		if (char === '[') {
			if (numbers.includes(nextChar)) {
				// the bracket is used to access an array
				insideNumberBrackets = true;
				continue; // skip rest of current char
			} else if (nextChar === '"') {
				// the string between the quotation-marks may not be empty
				if (path[i + 2] === '"') {
					throw new OPDUtilsObjectTraversalError(`Invalid character '${path[i + 2]}' at position ${i + 2} in "${path}", the string between the quotation-marks may not be empty`);
				}
				insideStringBrackets = true;
				i += 1; // skip next char
				continue; // skip rest of current char
			} else {
				throw new OPDUtilsObjectTraversalError(`Invalid character '${nextChar}' at position ${i + 1} in "${path}", expected number or '"' to follow a '['`);
			}
		}

		// string bracket exit condition
		if (insideStringBrackets && char === '"') {
			if (nextChar === ']') {
				insideStringBrackets = false;
				i += 1; // skip next char
				continue; // skip rest of current char
			} else {
				throw new OPDUtilsObjectTraversalError(`Invalid character '${nextChar}' at position ${i + 1} in "${path}", expected ']' to follow a '"'`);
			}
		}

		// number bracket exit condition
		if (insideNumberBrackets && char === ']') {
			insideNumberBrackets = false;
			continue;
		}

		if (insideStringBrackets && (char === '.' || char === ']' || char === '[')) {
			throw new OPDUtilsObjectTraversalError(`Invalid character '${char}' at position ${i} in "${path}"`);
		}

		if (insideNumberBrackets && !numbers.includes(char)) {
			throw new OPDUtilsObjectTraversalError(`Invalid character '${char}' at position ${i} in "${path}", number expected inside of brackets`);
		}

		if (!insideNumberBrackets && !insideStringBrackets) {
			if (char === ']') {
				throw new OPDUtilsObjectTraversalError(`Invalid character '${char}' at position ${i} in "${path}", expected '[' to proceed`);
			}
		}
	}
}
