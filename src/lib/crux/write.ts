import { getCruxFileInterface } from './versions';
import type {AnyCruxVersion } from './versions';
import type {CruxPuzzle} from './types';


/**
 * Format a puzzle as binary data. Binary data will be base64-encoded.
 */
export const write = (puzzle: CruxPuzzle, version: AnyCruxVersion | null = null): string => {
    // Use latest version unless explicitly told not to.
    const rw = getCruxFileInterface(version);

    if (!rw || !rw.write) {
        throw new Error(`Don't know how to format for version ${version}`);
    }

    return rw.write(puzzle);
};
