/**
 * Public interface to gridiron CSP solvers.
 */
import {fill as fillTs} from './autofill';
import {WordBank} from '../readcross/WordBank';
import {GridCell, IProgressStats} from './types';


/**
 * Fill in grid content based on initial constraints (i.e., the content given
 * in the input grid) and the provided word-lists.
 * @param {GridCell[]} grid
 * @param {{[p: string]: WordBank}} words
 * @param {(x: IProgressStats) => void} statsCallback
 * @param {number} updateInterval
 * @returns {Promise<GridCell[]>}
 */
export function fill(grid: GridCell[],
                     words: {[key: string]: WordBank},
                     statsCallback?: (x: IProgressStats) => void,
                     updateInterval: number = 2000): Promise<GridCell[]> {
    // TODO(jnu)
    // - Move TS implementation to WebWorker
    // - Write Rust implementation
    // - Graceful degradation Rust -> TS based on availability.
    return fillTs(grid, words, statsCallback, updateInterval);
}