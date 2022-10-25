export function traverseObject(path: string, o: any): any {
	let pathParts: string[] = parsePath(path);
	return traverseObjectByPath(pathParts, o);
}

export function traverseToParentByPath(path: string, o: any): { parent: any; child: { key: string; value: any } } {
	let pathParts: string[] = parsePath(path);

	if (pathParts.length === 0) {
		throw Error('invalid path');
	}
	if (pathParts[0] === '') {
		throw Error('invalid path');
	}

	let parentPath = pathParts.slice(0, -1);
	let childKey: string = pathParts.at(-1) ?? '';
	let parentObject = traverseObjectByPath(parentPath, o);
	return { parent: parentObject, child: { key: childKey, value: parentObject[childKey] } };
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
	return path
		.split('.')
		.map(x => x.split('[').map(y => (y.endsWith(']') ? y.substring(0, y.length - 1) : y)))
		.flat();
}
