export interface KeyValuePair<T, U> {
	key: T;
	value: U;
}

export function traverseObject(path: string, o: any): any {
	let pathParts: string[] = parsePath(path);
	return traverseObjectByPath(pathParts, o);
}

export function traverseObjectToParent(path: string, o: any): { parent: KeyValuePair<string[], any>; child: KeyValuePair<string, any> } {
	let pathParts: string[] = parsePath(path);

	if (pathParts[0] === '') {
		throw new OPDTraversalError('can not traverse to parent on self reference');
	}

	let parentPath = pathParts.slice(0, -1);
	let childKey: string = pathParts.at(-1) ?? '';
	let parentObject = traverseObjectByPath(parentPath, o);

	return {
		parent: { key: parentPath, value: parentObject },
		child: { key: childKey, value: parentObject[childKey] },
	};
}

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

export function parsePath(path: string): string[] {
	path = path.replace(/'/g, '"');
	validatePath(path);
	return path
		.split('.')
		.map(x => x.split('[').map(y => (y.endsWith(']') ? y.substring(0, y.length - 1) : y)))
		.flat();
}

export function validatePath(path: string): void {
	const allowedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_.[]"';
	const numbers = '0123456789';
	const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

	let insideStringBrackets: boolean = false;
	let insideNumberBrackets: boolean = false;
	for (let i = 0; i < path.length; i++) {
		const char = path[i];
		const nextChar = path[i + 1];

		if (!allowedCharacters.includes(char)) {
			throw new OPDTraversalError(`Invalid character "${char}" at position ${i} in "${path}", character ${char} is not a valid character`);
		}
		// if previous char was dot
		if (char === '.') {
			if (i === 0) {
				throw new OPDTraversalError(`Invalid character "${char}" at position ${i} in "${path}", path may not start with a dot`);
			}

			if (!(letters.includes(nextChar) || nextChar === '_')) {
				throw new OPDTraversalError(`Invalid character "${nextChar}" at position ${i + 1} in "${path}", expected a letter or underscore to follow a dot`);
			}
		}

		// bracket enter condition
		if (char === '[') {
			if (numbers.includes(nextChar)) {
				insideNumberBrackets = true;
				continue; // skip rest of current char
			} else if (nextChar === '"') {
				// make sure string inside of brackets does not start with a number or dot
				if (!(letters.includes(path[i + 2]) || path[i + 2] === '_')) {
					throw new OPDTraversalError(`Invalid character "${path[i + 2]}" at position ${i + 2} in "${path}", expected a letter or underscore to follow a "`);
				}
				insideStringBrackets = true;
				i += 1; // skip next char
				continue; // skip rest of current char
			} else {
				throw new OPDTraversalError(`Invalid character "${nextChar}" at position ${i + 1} in "${path}", expected number, " to follow a [`);
			}
		}

		// string bracket exit condition
		if (insideStringBrackets && char === '"') {
			if (nextChar === ']') {
				insideStringBrackets = false;
				i += 1; // skip next char
				continue; // skip rest of current char
			} else {
				throw new OPDTraversalError(`Invalid character "${nextChar}" at position ${i + 1} in "${path}", expected ] to follow "`);
			}
		}

		// number bracket exit condition
		if (insideNumberBrackets && char === ']') {
			insideNumberBrackets = false;
			continue;
		}

		if (insideStringBrackets && (char === '.' || char === ']' || char === '[')) {
			throw new OPDTraversalError(`Invalid character "${char}" at position ${i} in "${path}", expected letter, number or underscore expected inside of string`);
		}

		if (insideNumberBrackets && !numbers.includes(char)) {
			throw new OPDTraversalError(`Invalid character "${char}" at position ${i} in "${path}", number expected inside of brackets`);
		}

		if (!(insideNumberBrackets || insideStringBrackets)) {
			if (char === ']') {
				throw new OPDTraversalError(`Invalid character "${char}" at position ${i} in "${path}", expected [ to proceed`);
			}
		}
	}
}

export class OPDTraversalError extends Error {
	constructor(message: string) {
		super(message);
	}
}
