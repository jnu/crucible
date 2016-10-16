import Immutable from 'immutable';
import UUID from 'pure-uuid';
import { isDefined } from '../lib/isDefined';


/**
 * TODO:
 *     - Symmetrical block entering
 *     - Auto-adjust clues on block entering
 *     - Explore auto-adjusting other things on block entering
 */


/**
 * All block cells share the same state.
 */
const BLOCK_CELL = Immutable.Map({
    type: 'BLOCK',
    annotation: null,
    value: null,
    acrossWord: null,
    downWord: null,
    startOfWord: false,
    startClueIdx: null
});


/**
 * Grow/shrink the grid based on new size, filling in empty cells as needed.
 */
export const updateGridContent = (content, clues, height, width) => {
    const n = height * width;
    const newClues = [];
    const clueAcrossProjection = {};
    const clueDownProjection = {};

    content = content
            .setSize(n)
            .withMutations(mutContent => {
                // Fill in missing cells
                const rowAboveWords = new Array(width);
                let cellLeftWord = null;
                let colIdx = 0;
                let rightCell = null;
                let rightCellType = null;

                for (let i = 0; i < n; i++) {
                    const cell = rightCell || mutContent.get(i);
                    const cellType = rightCellType || (cell ? cell.get('type') : 'CONTENT');

                    // Next adjacent cell meta data
                    const hasRightCell = colIdx < (width - 1);
                    rightCell = hasRightCell && mutContent.get(i + 1);
                    rightCellType = rightCell && rightCell.get('type');

                    const belowCellIdx = i + width;
                    const hasBelowCell = belowCellIdx < (n - 1);
                    const belowCell = hasBelowCell && mutContent.get(belowCellIdx);
                    const belowCellType = belowCell && belowCell.get('type');


                    // Most of the interesting things happen with content cells.
                    if (cellType === 'CONTENT') {
                        // Determine the number of this across word. It may not
                        // have a number depending on its surroundings. Or, the
                        // number may be the same as the previous word. Or, it
                        // may be a new number.
                        const firstOpenAcross = !isDefined(cellLeftWord);
                        const nextIsOpenAcross = hasRightCell && (!rightCellType || rightCellType === 'CONTENT');
                        const hasAcrossClue = firstOpenAcross && nextIsOpenAcross;
                        const acrossWord = nextIsOpenAcross ?
                            firstOpenAcross ? newClues.length : cellLeftWord :
                            cellLeftWord;
                        // Do same determination for down words.
                        const cellAboveWord = rowAboveWords[colIdx];
                        const firstOpenDown = !isDefined(cellAboveWord);
                        const nextIsOpenDown = hasBelowCell && (!belowCellType || belowCellType === 'CONTENT');
                        const hasDownClue = firstOpenDown && nextIsOpenDown;
                        const downWord = nextIsOpenDown ?
                            firstOpenDown ? newClues.length : cellAboveWord :
                            cellAboveWord;

                        // Useful derived props
                        const startOfWord = hasAcrossClue || hasDownClue;
                        const startClueIdx = hasAcrossClue ?
                            acrossWord :
                            hasDownClue ? downWord : null;

                        let currentAcrossWord = null;
                        let currentDownWord = null;

                        // Now create/update the cell with this info.
                        if (cell) {
                            // Update an existing cell.
                            currentAcrossWord = cell.get('acrossWord');
                            currentDownWord = cell.get('downWord');
                            mutContent.set(i, cell.withMutations(mutCell => {
                                return mutCell
                                    .set('type', 'CONTENT')
                                    .set('value', mutCell.get('value') || '')
                                    .set('acrossWord', acrossWord)
                                    .set('downWord', downWord)
                                    .set('startOfWord', startOfWord)
                                    .set('startClueIdx', startClueIdx);
                            }));

                            // Mark existing clue as projected to prevent
                            // duplicates when a block splits a word.
                            if (isDefined(currentAcrossWord)) {
                                if (!clueAcrossProjection.hasOwnProperty(currentAcrossWord)) {
                                    clueAcrossProjection[currentAcrossWord] = acrossWord;
                                }
                            } else {
                                // If `currentAcrossWord` is not defined,
                                // assume the mapping to be 1:1.
                                clueAcrossProjection[acrossWord] = acrossWord;
                            }

                            // Do same for `downWord`
                            if (isDefined(currentDownWord)) {
                                if (!clueDownProjection.hasOwnProperty(currentDownWord)) {
                                    clueDownProjection[currentDownWord] = downWord;
                                }
                            } else {
                                clueDownProjection[downWord] = downWord;
                            }
                        } else {
                            // Create a new CONTENT cell.
                            mutContent.set(i, Immutable.Map({
                                type: 'CONTENT',
                                annotation: null,
                                value: '',
                                acrossWord,
                                downWord,
                                startOfWord,
                                startClueIdx
                            }));
                        }

                        // Add a new clue if necessary
                        if (hasAcrossClue || hasDownClue) {
                            newClues.push(Immutable.Map({
                                across: hasAcrossClue ? '' : null,
                                acrossStartIdx: hasAcrossClue ? i : null,
                                down: hasDownClue ? '' : null,
                                downStartIdx: hasDownClue ? i : null
                            }));
                        }

                        // Save state for next iteration
                        cellLeftWord = acrossWord;
                        rowAboveWords[colIdx] = downWord;
                    } else {
                        // When the cell is a BLOCK, clean up state
                        mutContent.set(i, BLOCK_CELL);
                        cellLeftWord = null;
                        rowAboveWords[colIdx] = null;
                    }

                    // Update pointer
                    if (colIdx < (width - 1)) {
                        colIdx += 1;
                    } else {
                        colIdx = 0;
                        cellLeftWord = null;
                    }
                }

                return mutContent;
            });

    // Project old clues into new clues. There are some tricky cases here where
    // clues can just disappear, e.g. if the old grid's CONTENT squares have
    // been shrunk to a single cell width. There might be a better way to
    // handle these, but for now they are just dropped.
    clues.forEach((clue, i) => {
        if (clueAcrossProjection.hasOwnProperty(i)) {
            const newIdx = clueAcrossProjection[i];
            const newClue = newClues[newIdx];
            if (newClue) {
                newClues[newIdx] = newClue.set('across', clue.get('across') || '');
            }
        }

        if (clueDownProjection.hasOwnProperty(i)) {
            const newIdx = clueDownProjection[i];
            const newClue = newClues[newIdx];
            if (newClue) {
                newClues[newIdx] = newClue.set('down', clue.get('down') || '');
            }
        }
    });


    return { clues: Immutable.List(newClues), content };
};


/**
 * Create a row/col Map that's within the grid boundaries, defined in State.
 */
export const snapToBounds = ({ state, index }) => {
    const max = state.get('content').length;
    return index < 0 ? 0 : index > max ? max : index;
};



/**
 * Default width
 */
const DEFAULT_WIDTH = 15;
/**
 * Default height
 */
const DEFAULT_HEIGHT = 15;
/**
 * Default content grid.
 */
const DEFAULT_GRID_INFO = updateGridContent(
    Immutable.List(),
    Immutable.List(),
    DEFAULT_HEIGHT,
    DEFAULT_WIDTH
);

/**
 * Default grid state.
 */
const createNewGrid = () => {
    const ts = Date.now();
    const id = new UUID(4);
    return Immutable.fromJS({
        // Grid state
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        content: DEFAULT_GRID_INFO.content,
        clues: DEFAULT_GRID_INFO.clues,

        // Meta state
        title: '',
        author: '',
        description: '',
        copyright: '',
        dateCreated: ts,
        lastModified: ts,
        symmetrical: true,
        id: id,

        // UX State
        cursor: null,
        cursorDirection: 'ACROSS',
        menuCell: null,
        cellSize: 30
    });
};



/**
 * Resize the grid according to new width and height.
 */
export const rResize = (state, action) => state.withMutations(mutState => {
    mutState.set('width', action.width);
    mutState.set('height', action.height);
    // Update the grid
    const { clues, content } = updateGridContent(
        mutState.get('content'),
        mutState.get('clues'),
        action.height,
        action.width
    );
    mutState.set('content', content);
    mutState.set('clues', clues);
    return mutState;
});


/**
 * Update the cell at the given index with the given parameters.
 */
export const rSetCell = (state, action) => {
    // TODO simpler deep mutation?
    let content = state.get('content');
    const { index } = action;
    let cell = content.get(index);

    const {
        cellType,
        annotation,
        value
    } = action;

    // Apply any changes set in the action
    if (cellType !== undefined) {
        cell = cell.set('type', cellType);
        // Apply symmetrical cell as well
        if (state.get('symmetrical')) {
            const contentMid = (content.size - 1) / 2;
            const mirrorIdx = ~~(contentMid + (contentMid - index));
            const mirrorCell = content.get(mirrorIdx);
            content = content.set(mirrorIdx, mirrorCell.set('type', cellType));
        }
    }
    if (annotation !== undefined) {
        cell = cell.set('annotation', annotation);
    }
    if (value !== undefined) {
        cell = cell.set('value', value);
    }

    content = content.set(index, cell);

    // Update the grid
    // TODO full update is expensive and not always necessary.
    const updates = updateGridContent(
        content,
        state.get('clues'),
        state.get('height'),
        state.get('width')
    );
    return state
        .set('content', updates.content)
        .set('clues', updates.clues);
};


/**
 * Move the cursor to the designated cell.
 */
export const rSelectCell = (state, action) => state.set(
    'cursor',
    snapToBounds({ state, index: action.index })
);


/**
 * Set the cursor direction.
 */
export const rSetCursorDirection = (state, action) => {
    const { direction } = action;
    if (direction !== 'ACROSS' && direction !== 'DOWN') {
        if (DEBUG) {
            console.error(`Illegal: unknown direction: ${direction}`);
        }
        return state;
    }
    return state.set('cursorDirection', direction);
};


/**
 * Hide the context menu for the designated cell.
 */
export const rHideMenu = (state, action) => state.set('menuCell', null);


/**
 * Show the context menu for the designated cell.
 */
export const rShowMenu = (state, action) => state.set(
    'menuCell',
    snapToBounds({ state, index: action.index })
);


/**
 * Update the value of a clue given the direction, its index, and a new value.
 */
export const rUpdateClue = (state, action) => {
    const { value, index, direction } = action;
    const clues = state.get('clues');
    const clue = clues.get(index);
    return state.set('clues', clues.set(
        index, clue.set((direction || '').toLowerCase(), value))
    );
};


/**
 * Move the cursor the amount specified by the delta in the direction currently
 * specified in state.
 */
export const rMoveCursor = (state, action) => {
    const { delta } = action;
    if (!delta) {
        return state;
    }
    const width = state.get('width');
    const height = state.get('height');
    const direction = state.get('cursorDirection');
    const cursor = state.get('cursor');

    // Horizontal movement
    if (direction === 'ACROSS') {
        const startCol = cursor % width;
        // Determine if move will keep cursor in same row. For now,
        // disallow any move that would require wrapping.
        const canMove = delta < 0 ?
            Math.abs(delta) <= startCol :
            (startCol + delta) < width;
        if (!canMove) {
            return state;
        }
        return state.set('cursor', cursor + delta);
    }
    // Vertical movement
    else {
        const startRow = ~~(cursor / width);
        const canMove = delta < 0 ?
            Math.abs(delta) <= startRow :
            (startRow + delta) < height;
        if (!canMove) {
            return state;
        }
        return state.set('cursor', cursor + delta * width);
    }
};


export const rSetGridShape = (state, action) => {
    const { content, width, height } = action;
    const updated = updateGridContent(content, state.get('clues'), height, width);
    return state.withMutations(mutState => {
        return mutState
            .set('content', updated.content)
            .set('clues', updated.clues)
            .set('width', width)
            .set('height', height);
    });
};

/**
 * Create a new grid and merge the given state into it (if any).
 */
export const rReplaceGrid = (state, action) => {
    const { grid, id } = action;
    const emptyGrid = createNewGrid();
    return emptyGrid.withMutations(mutState => {
        if (grid) {
            mutState.merge(grid);
            const { content, clues } = updateGridContent(
                grid.get('content'),
                grid.get('clues'),
                grid.get('height'),
                grid.get('width')
            );
            // The update procedure doesn't do a good job migrating clues when
            // no metadata is present yet (which it isn't when restoring from
            // a file). Just overwrite for now. TODO fix update procedure.
            // updated.set('clues', originalClues);
            mutState.set('content', content);
            mutState.set('clues', clues);
        }

        if (id) {
            mutState.set('id', new UUID(id));
        }
        return mutState;
    });
};


export const rToggleSymmetricalGrid = (state, action) => {
    return state.set('symmetrical', !state.get('symmetrical'));
};

/**
 * Set puzzle info key (e.g., action.key="title"; action.value="New title")
 */
export const rUpdatePuzzleInfo = (state, action) => {
    return state.set(action.key, action.value);
};


/**
 * Grid state reducer. Applies action transformations to state.
 */
const dispatchGridAction = (state, action) => {
    switch (action.type) {
        case 'RESIZE':
            return rResize(state, action);
        case 'SET_CELL':
            return rSetCell(state, action);
        case 'SELECT_CELL':
            return rSelectCell(state, action);
        case 'SET_CURSOR_DIRECTION':
            return rSetCursorDirection(state, action);
        case 'HIDE_MENU':
            return rHideMenu(state, action);
        case 'SHOW_MENU':
            return rShowMenu(state, action);
        case 'UPDATE_CLUE':
            return rUpdateClue(state, action);
        case 'MOVE_CURSOR':
            return rMoveCursor(state, action);
        case 'SET_GRID_SHAPE':
            return rSetGridShape(state, action);
        case 'REPLACE_GRID':
            return rReplaceGrid(state, action);
        case 'TOGGLE_SYMMETRICAL_GRID':
            return rToggleSymmetricalGrid(state, action);
        case 'UPDATE_PUZZLE_INFO':
            return rUpdatePuzzleInfo(state, action);
        default:
            return state;
    }
};


/**
 * Wrapper for reducer.
 *
 * NB: the default argument for `state` is evaluated only when state is
 * undefined, not on each reducer evaluation.
 */
export const grid = (state = createNewGrid(), action) => {
    const newState = dispatchGridAction(state, action);
    // Update last modified time as necessary
    return (newState !== state) ?
        newState.set('lastModified', Date.now()) :
        newState;
};
