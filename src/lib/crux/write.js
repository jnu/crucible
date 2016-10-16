import { getCruxFileInterface } from './versions';


/**
 * Format a puzzle as binary data. Binary data will be base64-encoded.
 * @param  {CruxObject} puzzle
 * @return {string}
 */
export const write = (puzzle, version = null) => {
    // Use latest version unless explicitly told not to.
    const rw = getCruxFileInterface(version);

    if (!rw || !rw.write) {
        throw new Error(`Don't know how to format for version ${version}`);
    }

    return rw.write(puzzle);
};
