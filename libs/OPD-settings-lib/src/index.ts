/**
 * untested
 */
export namespace OPDSettingsLib {

    export type CustomMigrationFunction<T> = (oldSettingsData: any, newDefaultSettingsData: T) => T;
    export type MigrationTable = MigrationStep<any>[];

    export interface Settings<T extends object> {
        version: Version.Version,
        data: T,
    }

    export class MigrationStep<T extends object> {
        version: Version.Version
        defaultSettings: T
        migrationFunction?: CustomMigrationFunction<T>

        constructor(version: OPDSettingsLib.Version.Version, defaultSettings: T, migrationFunction?: OPDSettingsLib.CustomMigrationFunction<T>) {
            this.version = version;
            this.defaultSettings = defaultSettings;
            this.migrationFunction = migrationFunction;
        }
    }

    export namespace Version {
        export class Version {
            major: number
            minor: number
            patch: number

            constructor(major: number, minor: number, patch: number) {
                this.major = major;
                this.minor = minor;
                this.patch = patch;
            }

            isBiggerThan(other: Version): boolean {
                if (other.major > this.major) {
                    return false;
                } else if (other.major < this.major) {
                    return true;
                } else {
                    if (other.minor > this.minor) {
                        return false;
                    } else if (other.minor < this.minor) {
                        return true;
                    } else {
                        if (other.patch > this.patch) {
                            return false;
                        } else if (other.patch < this.patch) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            }

            isEqual(other: Version) {
                return other.major === this.major && other.minor === this.minor && other.patch === this.patch;
            }
        }

        export function fromNumber(major: number, minor: number, patch: number) {
            return new Version(major, minor, patch);
        }

        export function fromString(version: string) {
            if (!version) {
                throw new Error('Version string may not be empty, version string must follow the format \'x.y.z\'');
            }

            if (version.startsWith('v')) {
                version = version.substring(1);
            }

            const versionParts = version.split('.');
            if (versionParts.length < 3) {
                throw new Error('Version string must follow the format \'x.y.z\'');
            } else if (versionParts.length > 3) {
                throw new Error('Version string must follow the format \'x.y.z\'');
            } else {
                const versionNumberParts: number[] = [];
                for (const versionPart of versionParts) {
                    const versionNumberPart = Number.parseInt(versionPart);
                    if (Number.isNaN(versionNumberPart)) {
                        throw new Error('Version string must follow the format \'x.y.z\', where x, y and z are integers');
                    }
                    versionNumberParts.push(versionNumberPart);
                }
                return new Version(versionNumberParts[0], versionNumberParts[1], versionNumberParts[2]);
            }
        }
    }

    export function applyMigrationStep<T extends object>(oldSettings: Settings<object>, migrationStep: MigrationStep<T>): Settings<T> {
        let newSettingsData: T;

        if (migrationStep.migrationFunction) {
            newSettingsData = applyCustomMigration(oldSettings.data, migrationStep.defaultSettings, migrationStep.migrationFunction);
        } else {
            newSettingsData = applyDefaultMigration(oldSettings.data, migrationStep.defaultSettings);
        }

        return {version: migrationStep.version, data: newSettingsData};
    }

    export function applyDefaultMigration<T extends object>(oldSettingsData: any, newDefaultSettingsData: T): T {
        const migratedSettingsData: T = {} as T;

        for (const key in newDefaultSettingsData) {
            migratedSettingsData[key] = oldSettingsData.hasOwnProperty(key) ? oldSettingsData[key] : newDefaultSettingsData[key];
        }

        return migratedSettingsData;
    }

    export function applyCustomMigration<T extends object>(oldSettingsData: any, newDefaultSettingsData: T, customMigration: CustomMigrationFunction<T>): T {
        return customMigration(oldSettingsData, newDefaultSettingsData);
    }

    export function migrateSettings(settings: Settings<object>, migrationTable: MigrationTable) {
        migrationTable = sortMigrationTableByVersion(migrationTable);

        for (const migrationStep of migrationTable) {
            if (migrationStep.version.isBiggerThan(settings.version)) {
                settings = applyMigrationStep(settings, migrationStep);
            }
        }

        return settings;
    }

    function sortMigrationTableByVersion(migrationTable: MigrationTable) {
        return migrationTable.sort((a, b) => {
            return a.version.isBiggerThan(b.version) ? 1 : -1;
        })
    }
}