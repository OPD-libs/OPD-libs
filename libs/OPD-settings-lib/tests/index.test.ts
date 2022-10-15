import {OPDSettingsLib} from '../lib';
import MigrationStep = OPDSettingsLib.MigrationStep;

describe('test Version', function () {
    test('fromNumber', () => {
        expect(OPDSettingsLib.Version.fromNumber(1, 2, 3))
            .toEqual(new OPDSettingsLib.Version.Version(1, 2, 3));
    });

    test('fromString', () => {
        expect(OPDSettingsLib.Version.fromString('v1.2.3'))
            .toEqual(new OPDSettingsLib.Version.Version(1, 2, 3));

        expect(OPDSettingsLib.Version.fromString('1.2.3'))
            .toEqual(new OPDSettingsLib.Version.Version(1, 2, 3));
    });


    describe('isBiggerThan', function () {
        test('patch', () => {
            expect(OPDSettingsLib.Version.fromNumber(1, 2, 3)
                .isBiggerThan(OPDSettingsLib.Version.fromNumber(1, 2, 2)))
                .toEqual(true);

            expect(OPDSettingsLib.Version.fromNumber(1, 2, 3)
                .isBiggerThan(OPDSettingsLib.Version.fromNumber(1, 2, 4)))
                .toEqual(false);
        });

        test('minor', () => {
            expect(OPDSettingsLib.Version.fromNumber(1, 2, 3)
                .isBiggerThan(OPDSettingsLib.Version.fromNumber(1, 1, 3)))
                .toEqual(true);

            expect(OPDSettingsLib.Version.fromNumber(1, 2, 3)
                .isBiggerThan(OPDSettingsLib.Version.fromNumber(1, 3, 3)))
                .toEqual(false);
        });

        test('major', () => {
            expect(OPDSettingsLib.Version.fromNumber(1, 2, 3)
                .isBiggerThan(OPDSettingsLib.Version.fromNumber(0, 2, 3)))
                .toEqual(true);

            expect(OPDSettingsLib.Version.fromNumber(0, 2, 3)
                .isBiggerThan(OPDSettingsLib.Version.fromNumber(1, 2, 3)))
                .toEqual(false);
        });

        test('equal', () => {
            expect(OPDSettingsLib.Version.fromNumber(1, 2, 3)
                .isBiggerThan(OPDSettingsLib.Version.fromNumber(1, 2, 3)))
                .toEqual(false);
        });
    });

    test('isEqual', () => {
        expect(OPDSettingsLib.Version.fromNumber(1, 2, 3)
            .isEqual(OPDSettingsLib.Version.fromNumber(1, 2, 3)))
            .toEqual(true);

        expect(OPDSettingsLib.Version.fromNumber(1, 2, 3)
            .isEqual(OPDSettingsLib.Version.fromNumber(1, 1, 3)))
            .toEqual(false);
    });
});

interface Settings_0_0_1 {
    string1: string,
    number1: number,
}

interface Settings_0_0_2 {
    string1: string,
    number2: number,
}

interface Settings_0_0_3 {
    string1: string,
    number2: number,
}

const SETTINGS_0_0_1_DEFAULT_SETTINGS: Settings_0_0_1 = {
    string1: 'test1',
    number1: 1,
}

const SETTINGS_0_0_2_DEFAULT_SETTINGS: Settings_0_0_2 = {
    string1: 'test1',
    number2: 2,
}

const SETTINGS_0_0_3_DEFAULT_SETTINGS: Settings_0_0_3 = {
    string1: 'test1',
    number2: 3,
}


const migrationTable: OPDSettingsLib.MigrationTable = [
    new MigrationStep<Settings_0_0_1>(
        OPDSettingsLib.Version.fromNumber(0, 0, 1),
        SETTINGS_0_0_1_DEFAULT_SETTINGS,
    ),

    new MigrationStep<Settings_0_0_2>(
        OPDSettingsLib.Version.fromNumber(0, 0, 2),
        SETTINGS_0_0_2_DEFAULT_SETTINGS,
    ),
    new MigrationStep<Settings_0_0_3>(
        OPDSettingsLib.Version.fromNumber(0, 0, 3),
        SETTINGS_0_0_3_DEFAULT_SETTINGS,
    ),
]

const migrationTable2: OPDSettingsLib.MigrationTable = [
    new MigrationStep<Settings_0_0_1>(
        OPDSettingsLib.Version.fromNumber(0, 0, 1),
        SETTINGS_0_0_1_DEFAULT_SETTINGS,
    ),

    new MigrationStep<Settings_0_0_2>(
        OPDSettingsLib.Version.fromNumber(0, 0, 2),
        SETTINGS_0_0_2_DEFAULT_SETTINGS,
        (oldSettingsData, newDefaultSettingsData) => {
            const newSettings = OPDSettingsLib.applyDefaultMigration(oldSettingsData, newDefaultSettingsData);
            newSettings.number2 = oldSettingsData.number1;
            return newSettings;
        }
    ),

    new MigrationStep<Settings_0_0_3>(
        OPDSettingsLib.Version.fromNumber(0, 0, 3),
        SETTINGS_0_0_3_DEFAULT_SETTINGS,
    ),
]

describe('test migration', function () {
    test('full default migration', () => {
        expect(OPDSettingsLib.migrateSettings({
            version: OPDSettingsLib.Version.fromNumber(0,0,1),
            data: SETTINGS_0_0_1_DEFAULT_SETTINGS,
        }, migrationTable))
            .toEqual({
                version: OPDSettingsLib.Version.fromNumber(0, 0, 3),
                data: {
                    string1: 'test1',
                    number2: 2,
                }
            })
    });

    test('full custom migration', () => {
        expect(OPDSettingsLib.migrateSettings({
            version: OPDSettingsLib.Version.fromNumber(0,0,1),
            data: SETTINGS_0_0_1_DEFAULT_SETTINGS,
        }, migrationTable2))
            .toEqual({
                version: OPDSettingsLib.Version.fromNumber(0, 0, 3),
                data: {
                    string1: 'test1',
                    number2: 1,
                }
            })
    });
});