import { Internal } from '../Internal';

describe('tests for internal methods', () => {
	let testObj = {};

	beforeEach(() => {
		testObj = {
			a: 1,
			b: {
				c: 2,
				d: [3, 4],
			},
		};
	});

	test('test hasField', () => {
		expect(Internal.hasField('a', testObj)).toEqual(true);

		expect(Internal.hasField('b.c', testObj)).toEqual(true);

		expect(Internal.hasField('b.d[1]', testObj)).toEqual(true);

		expect(Internal.hasField('e', testObj)).toEqual(false);

		expect(Internal.hasField('b.d[2]', testObj)).toEqual(false);
	});

	test('test getField', () => {
		expect(Internal.getField('b.c', testObj)).toEqual(2);

		expect(Internal.getField('a', testObj)).toEqual(1);

		expect(Internal.getField('b.d[1]', testObj)).toEqual(4);

		expect(Internal.getField('e', testObj)).toEqual(undefined);

		expect(Internal.getField('b.d[2]', testObj)).toEqual(undefined);
	});

	test('test deleteField', () => {
		expect(Internal.deleteField('a', testObj)).toEqual({
			b: {
				c: 2,
				d: [3, 4],
			},
		});

		expect(Internal.deleteField('b.c', testObj)).toEqual({
			b: {
				d: [3, 4],
			},
		});

		expect(Internal.deleteField('b.d[0]', testObj)).toEqual({
			b: {
				d: [4],
			},
		});
	});

	test('test updateField', () => {
		expect(Internal.updateField('a', 2, testObj)).toEqual({
			a: 2,
			b: {
				c: 2,
				d: [3, 4],
			},
		});

		expect(Internal.updateField('b.d[0]', 2, testObj)).toEqual({
			a: 2,
			b: {
				c: 2,
				d: [2, 4],
			},
		});

		expect(() => Internal.updateField('b.e', 2, testObj)).toThrow();
	});

	test('test insertField', () => {
		expect(Internal.insertField('e', 2, testObj)).toEqual({
			a: 1,
			b: {
				c: 2,
				d: [3, 4],
			},
			e: 2,
		});

		expect(Internal.insertField('b.d[2]', 2, testObj)).toEqual({
			a: 1,
			b: {
				c: 2,
				d: [3, 4, 2],
			},
			e: 2,
		});

		expect(() => Internal.insertField('b.c', 3, testObj)).toThrow();

		expect(() => Internal.insertField('b.e.c', 3, testObj)).toThrow();
	});

	/*
	describe('test property array conversions', () => {
		const propertyArray: Internal.Property[] = [
			{
				type: Internal.PropertyType.YAML,
				key: 'title',
				value: 'Kimi no Na wa.',
			},
			{
				type: Internal.PropertyType.YAML,
				key: 'episodes',
				value: 1,
			},
			{
				type: Internal.PropertyType.YAML,
				key: 'genres',
				value: ['Award Winning', 'Drama', 'Supernatural'],
			},
			{
				type: Internal.PropertyType.YAML,
				key: 'statistics',
				value: {
					score: 8.86,
					ranked: 24,
					popularity: 11,
				},
			},
		];
		const expectedObj: any = {
			title: 'Kimi no Na wa.',
			episodes: 1,
			genres: ['Award Winning', 'Drama', 'Supernatural'],
			statistics: {
				score: 8.86,
				ranked: 24,
				popularity: 11,
			},
		};

		test('convert to object - should convert the property array into an object', () => {
			expect(Internal.propertyArrayToObject(propertyArray)).toEqual(expectedObj);
		});

		test('convert to Frontmatter - should convert the property array into Frontmatter', () => {
			// sorry AB, here idk how to mock obsidian's stringifyYaml function
			// expect(OPDMetadataLib.propertyArrayToYAML(propertyArray)).toEqual(expectedYAML);
		});
	});

	describe('test updatePropertyArray', () => {
		let propertyArray: Internal.Property[];
		beforeEach(() => {
			propertyArray = [
				{
					type: Internal.PropertyType.YAML,
					key: 'title',
					value: 'Kimi no Na wa.',
				},
			];
		});

		test('update existent property - should update the existing property', () => {
			expect(Internal.updatePropertyArray(propertyArray, { key: 'title', value: 'Your Name.', type: Internal.PropertyType.YAML })).toEqual([
				{
					type: Internal.PropertyType.YAML,
					key: 'title',
					value: 'Your Name.',
				},
			]);
		});

		test('update non existent property - should throw', () => {
			expect(() => Internal.updatePropertyArray(propertyArray, { key: 'episodes', value: 1, type: Internal.PropertyType.YAML })).toThrow();
		});
	});
	*/
});
