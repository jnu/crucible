import {
    write as v0_write,
    read as v0_read,
    headerSchema as v0_headerSchema
} from './v0';


/**
 * Map of version number to reader, writer, and header schema.
 */
const VERSIONS = {
    0: {
        read: v0_read,
        write: v0_write,
        headerSchema: v0_headerSchema
    }
} as const;

/**
 * Any valid version number.
 */
export type AnyCruxVersion = keyof typeof VERSIONS;

/**
 * Default version to use if no specific one was specified.
 */
const _currentVersion = 0 as const;

/**
 * Verify that the given input is a valid version.
 *
 * Throws an error if not.
 */
export const validateVersion = (v: unknown) => {
  if (VERSIONS.hasOwnProperty(v as any)) {
    return v as AnyCruxVersion;
  }
  throw new Error(`invalid Crux version: ${v}`);
};

/**
 * Get the interface for reading/writing a Crux file. By default get the latest
 * version, or the one that was specified.
 */
export const getCruxFileInterface = (version: keyof typeof VERSIONS | null = null) => {
    if (version === null) {
        version = _currentVersion;
    }

    if (!VERSIONS.hasOwnProperty(version)) {
        throw new Error(`Invalid crux version ${version}`);
    }

    return {...VERSIONS[version]};
};
