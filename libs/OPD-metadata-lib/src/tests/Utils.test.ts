import { traverseObject } from '../Utils';

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

	test('simple object traversal', () => {
		expect(traverseObject('a.a_a.a_a_a', testObject)).toEqual(testObject.a.a_a.a_a_a);
		expect(traverseObject('a.a_a.a_a_b', testObject)).toEqual(testObject.a.a_a.a_a_b);
		expect(traverseObject('a.a_a', testObject)).toEqual(testObject.a.a_a);
		expect(traverseObject('a', testObject)).toEqual(testObject.a);
	});

	test('object and array traversal', () => {
		expect(traverseObject('b[1].b_1_a', testObject)).toEqual(testObject.b[1].b_1_a);
		expect(traverseObject('b[1].b_1_b', testObject)).toEqual(testObject.b[1].b_1_b);
		expect(traverseObject('b[1]', testObject)).toEqual(testObject.b[1]);
	});

	test('more object and array traversal', () => {
		expect(traverseObject('b[0].b_0_a[0]', testObject)).toEqual(testObject.b[0].b_0_a[0]);
		expect(traverseObject('b[0].b_0_b[1]', testObject)).toEqual(testObject.b[0].b_0_b[1]);
		expect(traverseObject('b[0].b_0_c[1].b_0_c_0_a', testObject)).toEqual(testObject.b[0].b_0_c[1].b_0_c_0_a);
	});

	test('edge cases', () => {
		expect(traverseObject('', testObject)).toEqual(testObject);
		expect(traverseObject('a[b].b.c.e', testObject)).toEqual(undefined);
	});
});
