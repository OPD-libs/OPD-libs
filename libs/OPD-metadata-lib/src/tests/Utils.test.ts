import { OPDTraversalError, traverseObject, validatePath } from '../Utils';

describe('test traverseObject', () => {
	const testObject: any = {
		a: {
			a_a: {
				a_a_a: 1,
				a_a_b: 2,
				a_a_c: 3,
			},
			a_b: {
				a_b_a: 'a',
				a_b_b: 'b',
				a_b_c: 'c',
			},
		},
		b: [
			{
				b_0_a: [1, 2, 3],
				b_0_b: ['a', 'b', 'c'],
				b_0_c: [
					{
						b_0_c_0_a: 1,
					},
					{
						b_0_c_1_a: 2,
					},
					{
						b_0_c_2_a: 3,
					},
				],
			},
			{
				b_1_a: 'a',
				b_1_b: 'b',
				b_1_c: 'c',
			},
		],
	};

	test('object traversal', () => {
		expect(traverseObject('a', testObject)).toEqual(testObject.a);
		expect(traverseObject('a.a_a', testObject)).toEqual(testObject.a.a_a);
		expect(traverseObject('a.a_a.a_a_a', testObject)).toEqual(testObject.a.a_a.a_a_a);
		expect(traverseObject('a.a_a.a_a_b', testObject)).toEqual(testObject.a.a_a.a_a_b);
	});

	test('object and array traversal', () => {
		expect(traverseObject('b[1]', testObject)).toEqual(testObject.b[1]);
		expect(traverseObject('b[1].b_1_a', testObject)).toEqual(testObject.b[1].b_1_a);
		expect(traverseObject('b[1].b_1_b', testObject)).toEqual(testObject.b[1].b_1_b);
	});

	test('complex object and array traversal', () => {
		expect(traverseObject('b[0].b_0_a[0]', testObject)).toEqual(testObject.b[0].b_0_a[0]);
		expect(traverseObject('b[0].b_0_b[1]', testObject)).toEqual(testObject.b[0].b_0_b[1]);
		expect(traverseObject('b[0].b_0_c[1].b_0_c_0_a', testObject)).toEqual(testObject.b[0].b_0_c[1].b_0_c_0_a);
	});

	test('object traversal using array notation', () => {
		expect(traverseObject('a["a_a"]', testObject)).toEqual(testObject.a.a_a);
	});

	test('edge cases', () => {
		expect(traverseObject('', testObject)).toEqual(testObject);
		expect(traverseObject('a["b"].b.c.e', testObject)).toEqual(undefined);
	});
});

describe('test validatePath', () => {
	test('should not throw on valid path', () => {
		expect(() => validatePath('')).not.toThrow();

		expect(() => validatePath('a')).not.toThrow();

		expect(() => validatePath('a.b')).not.toThrow();

		expect(() => validatePath('a[0]')).not.toThrow();

		expect(() => validatePath('a.b[0]')).not.toThrow();

		expect(() => validatePath('a.b[0].c')).not.toThrow();

		expect(() => validatePath('[0]')).not.toThrow();

		expect(() => validatePath('[0][1]["a"]')).not.toThrow();
	});

	test('should throw on empty path part', () => {
		expect(() => validatePath('.')).toThrow(OPDTraversalError);

		expect(() => validatePath('..')).toThrow(OPDTraversalError);

		expect(() => validatePath('a..b')).toThrow(OPDTraversalError);

		expect(() => validatePath('a.')).toThrow(OPDTraversalError);

		expect(() => validatePath('.a')).toThrow(OPDTraversalError);
	});

	test('should throw on invalid character inside brackets', () => {
		expect(() => validatePath('[.]')).toThrow(OPDTraversalError);

		expect(() => validatePath('[]')).toThrow(OPDTraversalError);

		expect(() => validatePath('[a]')).toThrow(OPDTraversalError);

		expect(() => validatePath('["a.b"]')).toThrow(OPDTraversalError);

		expect(() => validatePath('["a."]')).toThrow(OPDTraversalError);

		expect(() => validatePath('["a["]')).toThrow(OPDTraversalError);
	});

	test('should throw on other invalid paths', () => {
		expect(() => validatePath('a]b')).toThrow(OPDTraversalError);
	});
});
