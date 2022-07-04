import {WordBank} from '../readcross/WordBank';
import {Future} from '../Future';
import {v4} from '../uuid';
import {shuffle} from '../shuffle';
import {GridCell, IGridContentCell, IProgressStats, IGridWord} from "./types";


/**
 * A searched node in the grid that tracks its original constraint input so
 * that it can be restored when backtracking.
 */
interface IGridNode {
    word: IGridWord;
    originalCells: IGridContentCell[];
}

/**
 * Structured grid; a view on the linear grid.
 */
interface IGridInfo {
    across: IGridWord[];
    down: IGridWord[];
}

/**
 * Create a deep clone of the grid.
 * @param {GridCell[]} g
 * @returns {GridCell[]}
 * @private
 */
function _clone(g: GridCell[]) {
    return JSON.parse(JSON.stringify(g)) as GridCell[];
}

/**
 * Get an empty grid word search node.
 * @returns {IGridWord}
 * @private
 */
function _emptyGridWord(): IGridWord {
    return {cells: [], size: 0, choices: undefined};
}

/**
 * Concatenate the given cell onto the given words list.
 * @param {IGridWord[]} words
 * @param {IGridContentCell} cell
 * @param {number} idx
 * @private
 */
function _addCellToGridWords(words: IGridWord[], cell: IGridContentCell, idx: number) {
    if (!words[idx]) {
        words[idx] = _emptyGridWord();
    }
    words[idx].cells.push(cell);
    words[idx].size += 1;
}

/**
 * Take the values of an object. TODO(jnu) why not Object.values?
 * @param {{[p: string]: U}} obj
 * @returns {U[]}
 * @private
 */
function _values<U>(obj: {[key: string]: U}): U[] {
    return Object.keys(obj).map(k => obj[k]);
}

/**
 * Turn linear grid into a more structure grouped by word, sorted by size (descending).
 * @param {GridCell[]} grid
 * @returns {IGridInfo}
 */
function processGrid(grid: GridCell[]): IGridInfo {
    const acrossWords: IGridWord[] = [];
    const downWords: IGridWord[] = [];

    for (let cell of grid) {
        if (cell.type === 'BLOCK') {
            continue;
        }
        // Ensure that cell has a unique ID. The ID itself is arbitrary.
        cell._id = cell._id || v4();
        _addCellToGridWords(acrossWords, cell, cell.acrossWord);
        _addCellToGridWords(downWords, cell, cell.downWord);
    }

    // Add reference links to cells.
    for (let cell of grid) {
        if (cell.type === 'BLOCK') {
            continue;
        }
        cell._acrossWordRef = acrossWords[cell.acrossWord];
        cell._downWordRef = downWords[cell.downWord];
    }

    return {
        across: acrossWords.sort((a, b) => a.size > b.size ? -1 : 1),
        down: downWords.sort((a, b) => a.size > b.size ? -1 : 1),
    };
}

/**
 * Get a list of words that match a give query. Uses all available word lists.
 * @param {{[p: string]: WordBank}} words
 * @param {string} query
 * @returns {Promise<string[]>}
 */
function getWordsByQuery(words: {[key: string]: WordBank}, query: string) {
    return Promise.all(_values(words).map(b => b.search(query)))
        .then(wordLists => wordLists.reduce((agg, list) => agg.concat(list), []));
}

/**
 * Check whether the search query is satisfiable by any word list.
 * @param {{[p: string]: WordBank}} words
 * @param {string} query
 * @returns {boolean}
 */
function testQuery(words: {[key: string]: WordBank}, query: string) {
    return _values(words).some(list => list.testSync(query));
}

/**
 * Formulate a search query from the grid word's cells.
 * @param {IGridWord} w
 * @returns {string}
 */
function createSearchQuery(w: IGridWord) {
    return w.cells.map(c => c.value || '*').join('');
}

/**
 * Populate the grid with words that satisfy both the initial explicit
 * constraints (i.e., the fill that's in the grid already) as well as
 * the implicit contraints (i.e., that every crossing is a valid word).
 *
 * The returned future can be canceled if necessary.
 *
 * @param {GridCell[]} grid
 * @param {{[p: string]: WordBank}} words
 * @param {(x: IProgressStats) => void} statsCallback
 * @param {number} updateInterval
 * @returns {Future<GridCell[]>}
 */
export function fill(grid: GridCell[],
                     words: {[key: string]: WordBank},
                     statsCallback?: (x: IProgressStats) => void,
                     updateInterval: number = 500): Future<GridCell[]> {
    grid = _clone(grid);
    // Extract and sort content cells from raw grid.
    // This constructs a view on the existing (cloned) grid, so that references can be modified
    // and the grid returned without a separate call to reconstruct the grid format.
    const gridInfo = processGrid(grid);

    // Keep a queue of nodes left to visit.
    const queue = gridInfo.across.slice();
    // Keep a stack of visited nodes for backtracking.
    const parents: IGridNode[] = [];
    // Flag that lets routine be aborted
    let canceled = false;

    // Collect some stats on performance.
    let testedPatterns = 0;
    let pruned = 0;
    let backtracks = 0;
    let visits = 0;
    let start = Date.now();
    let totalWords = queue.length;
    // TODO(jnu) track size of search space and amount remaining.

    // Recursive async function to solve the constraint problem.
    function _processNext(): Promise<void> {
        const w = queue.shift();
        if (!w) {
            return Promise.resolve();
        }
        visits += 1;

        // Give a progress update occasionally.
        if (DEBUG && statsCallback) {
            const now = Date.now();
            const elapsed = now - start;
            if (now - start > updateInterval) {
                statsCallback({
                    elapsedTime: elapsed / 1000,
                    rate: testedPatterns / (elapsed / 1000),
                    n: testedPatterns,
                    backtracks,
                    pruned,
                    visits,
                    totalWords,
                    leftToSolve: queue.length + 1,
                });
            }
        }

        // Get options for words
        const wordChoicesPromise = w.choices ?
            Promise.resolve(w.choices) :
            getWordsByQuery(words, createSearchQuery(w)).then(shuffle);

        // Choose a new word, constrained by the existing value of the word.
        return wordChoicesPromise
            .then(choices => {
                // Make sure choices are kept associated with this node.
                w.choices = choices;
                let newWord: string | void = undefined;

                // Try to find a word to fill this position.
                while (choices.length) {
                    // Check if the process was killed. Pick a place to do this
                    // check that will be reasonably responsive but avoid doing
                    // it on every inner loop iteration.
                    if (canceled) {
                        throw new Error('canceled');
                    }
                    let candidate = choices.shift();
                    let satisfiable = true;

                    // Check if this word satisfies constraints.
                    for (let i = 0; i < w.cells.length; i++) {
                        const cell = w.cells[i];
                        const downWord = cell._downWordRef;
                        if (!downWord) {
                          // TODO - is this an error?
                          continue;
                        }
                        let intersectIdx = -1;
                        let query = '';
                        let foundIntersect = false;

                        for (let j = 0; j < downWord.cells.length || 0; j++) {
                            const dc = downWord.cells[j];
                            if (dc._id === cell._id) {
                                foundIntersect = true;
                                query += candidate![i];
                                intersectIdx = j;
                            } else {
                                query += dc.value || '*';
                            }
                        }

                        // Sanity check: if the cells didn't intersect we were
                        // not searching the right cross :(
                        if (!foundIntersect) {
                            console.warn(" - Failed to find intersect of down / across!");
                        }

                        const ok = testQuery(words, query);
                        testedPatterns += 1;
                        if (!ok) {
                            satisfiable = false;
                            // Prune the search space: no candidate with the same
                            // character in the intersect position will have a
                            // different outcome, so remove them.
                            const badChar = candidate![intersectIdx];
                            w.choices = choices.filter(choice => choice[intersectIdx] !== badChar);
                            const numPruned = choices.length - w.choices.length;
                            pruned += numPruned;
                            break;
                        }
                    }
                    // If the word satisfies constraints, use it.
                    if (satisfiable) {
                        newWord = candidate;
                        break;
                    }
                }

                // If word can't be found, backtrack.
                if (!newWord) {
                    // Get the last node searched from the parents stack.
                    const parent = parents.pop();
                    // If there is no parent, the puzzle is unsolvable :(
                    // This may either mean the grid is poorly formed, the word
                    // lists are not very good, or that the initial constraints
                    // are too tight.
                    if (!parent) {
                        console.warn("There is no solution to this puzzle with the given constraints.");
                        return Promise.reject("Unsolvable");
                    }
                    backtracks += 1;
                    // Add this word back to the queue, resetting its choices.
                    w.choices = undefined;
                    queue.unshift(w);
                    // Revert the node to its original state.
                    parent.word.cells = parent.originalCells;
                    // Add the parent back into the queue for re-processing.
                    queue.unshift(parent.word);
                    return;
                }

                // Add this node to the parent stack.
                parents.push({word: w, originalCells: w.cells.slice()});

                // Write new word into cells.
                newWord
                    .split('')
                    .forEach((c, i) => w.cells[i].value = c);
            })
            .then(_processNext)
    }

    const result = _processNext()
        // Transform cells back into external format before returning.
        .then(() => grid.map(c => ({
            type: c.type,
            startClueIdx: c.startClueIdx,
            acrossWord: c.acrossWord,
            downWord: c.downWord,
            value: c.value,
            annotation: c.annotation,
            startOfWord: c.startOfWord,
        } as GridCell)));

    // Return a cancelable future
    return new Future(result, () => {
        canceled = true;
    });
}
