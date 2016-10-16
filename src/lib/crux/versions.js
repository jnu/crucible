import {
    write as v0_write,
    read as v0_read,
    headerSchema as v0_headerSchema
} from './v0';


/**
 * Map of version number to reader, writer, and header schema.
 * @type {Object}
 */
const VERSIONS = {
    0: {
        read: v0_read,
        write: v0_write,
        headerSchema: v0_headerSchema
    }
};


/**
 * Get the latest version of Crux.
 * @return {Number}
 */
const getLatestCruxVersion = () => Math.max(Object.keys(VERSIONS));


/**
 * Get the interface for reading/writing a Crux file. By default get the latest
 * version, or the one that was specified.
 * @param  {Number} version?
 * @return {CruxFileInterface}
 */
export const getCruxFileInterface = (version = null) => {
    if (version === null) {
        version = getLatestCruxVersion();
    }

    if (!VERSIONS.hasOwnProperty(version)) {
        throw new Error(`Invalid crux version ${version}`);
    }

    return Object.assign({}, VERSIONS[version]);
};
