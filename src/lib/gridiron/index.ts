/**
 * Public interface to gridiron CSP solvers.
 */

import {IJSONWordIndex, WordBank} from '../readcross/WordBank';
import {GridCell, IProgressStats, GridIronResponse, IWorkerMessage, IGridIronSolveMessage} from './types';
import {Deferred} from "../deferred";

// Re-export useful types.
export {CellType, GridCell} from './types';


function _sendAutoFillMessageToWorker(worker: Worker,
                                      grid: GridCell[],
                                      wordlists: {[key: string]: IJSONWordIndex[]},
                                      updateInterval: number) {
    const msg: IGridIronSolveMessage = {
        type: 'SOLVE',
        grid,
        wordlists,
        updateInterval,
    };
    worker.postMessage(msg);
}

function _runAutoFillOnWorker(grid: GridCell[],
                              words: {[key: string]: WordBank},
                              statsCallback?: (x: IProgressStats) => void,
                              updateInterval: number = 2000): Promise<GridCell[]> {
    const worker = new Worker(new URL('./autofill.worker', import.meta.url));
    const deferred = new Deferred<GridCell[]>();

    worker.addEventListener('message', (event: IWorkerMessage<GridIronResponse>) => {
        switch (event.data.type) {
            case 'SOLUTION':
                return deferred.resolve(event.data.solution);
            case 'ERROR':
                return deferred.reject(new Error(event.data.message));
            case 'PROGRESS':
                if (statsCallback) {
                  return statsCallback(event.data.data);
                }
                return;
            default:
                throw new Error(`Unknown event from worker ${JSON.stringify(event.data)}`);
        }
    });

    const jsonLists = _serializeWordLists(words);
    _sendAutoFillMessageToWorker(worker, grid, jsonLists, updateInterval);

    return deferred.promise;
}

function _serializeWordLists(words: {[key: string]: WordBank}): {[key: string]: IJSONWordIndex[]} {
    const json: {[key: string]: IJSONWordIndex[]} = {};
    Object.keys(words).forEach(key => {
        json[key] = words[key].toJSON();
    });
    return json;
}


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
                     updateInterval: number = 500): Promise<GridCell[]> {
    // TODO(jnu)
    // - Fix update interval
    // - Write Rust implementation
    // - Graceful degradation Rust -> TS based on availability.
    // - Lock so that multiple threads aren't spawned
    // - Ability to cancel processing
    return _runAutoFillOnWorker(grid, words, statsCallback, updateInterval);
}
