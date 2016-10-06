import Immutable from 'immutable';


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
export const updateGridContent = (content, height, width) => {
    const n = height * width;
    const clues = [];
    const clueAcrossProjection = {};
    const clueDownProjection = {};
    content = content
            .setSize(n)
            .withMutations(mutContent => {
                // Fill in missing cells
                const rowAboveWords = new Array(width);
                let cellLeftWord = null;
                let colIdx = 0;
                let rightCell = null
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
                        const firstOpenAcross = cellLeftWord === null || cellLeftWord === undefined;
                        const nextIsOpenAcross = hasRightCell && (!rightCellType || rightCellType === 'CONTENT');
                        const hasAcrossClue = firstOpenAcross && nextIsOpenAcross;
                        const acrossWord = nextIsOpenAcross ?
                            firstOpenAcross ? clues.length : cellLeftWord :
                            cellLeftWord;
                        // Do same determination for down words.
                        const cellAboveWord = rowAboveWords[colIdx];
                        const firstOpenDown = cellAboveWord === null || cellAboveWord === undefined;
                        const nextIsOpenDown = hasBelowCell && (!belowCellType || belowCellType === 'CONTENT');
                        const hasDownClue = firstOpenDown && nextIsOpenDown;
                        const downWord = nextIsOpenDown ?
                            firstOpenDown ? clues.length : cellAboveWord :
                            cellAboveWord;

                        // Useful derived props
                        const startOfWord = hasAcrossClue || hasDownClue;
                        const startClueIdx = hasAcrossClue ? acrossWord : hasDownClue ? downWord : null

                        // Now create/update the cell with this info.
                        if (cell) {
                            // Update an existing cell.
                            const currentAcrossWord = cell.get('acrossWord');
                            const currentDownWord = cell.get('downWord');
                            mutContent.set(i, cell.withMutations(mutCell => {
                                return mutCell
                                    .set('acrossWord', acrossWord)
                                    .set('downWord', downWord)
                                    .set('startOfWord', startOfWord)
                                    .set('startClueIdx', startClueIdx);
                            }));

                            // Project existing clues into the new grid space.
                            // In the case of splitting (i.e., a block was added
                            // that splits an existing word in two), only the
                            // first half should get the original clue. The
                            // latter half will have an empty clue.
                            if (currentAcrossWord !== null && currentAcrossWord !== undefined && currentAcrossWord !== acrossWord) {
                                if (!clueAcrossProjection.hasOwnProperty(currentAcrossWord)) {
                                    clueAcrossProjection[currentAcrossWord] = acrossWord
                                }
                            }

                            if (currentDownWord !== null && currentDownWord !== undefined && currentDownWord !== downWord) {
                                if (!clueDownProjection.hasOwnProperty(currentDownWord)) {
                                    clueDownProjection[currentDownWord] = downWord;
                                }
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
                            clues.push(Immutable.Map({
                                across: hasAcrossClue ? '' : null,
                                down: hasDownClue ? '' : null
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


    // TODO: project clues using maps


    return { clues: Immutable.List(clues), content };
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
const DEFAULT_GRID_INFO = updateGridContent(Immutable.List(), DEFAULT_WIDTH, DEFAULT_HEIGHT);

/**
 * Default grid state.
 */
const DEFAULT_GRID = Immutable.fromJS({
    // Grid state
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    content: DEFAULT_GRID_INFO.content,
    clues: DEFAULT_GRID_INFO.clues,

    // Meta state
    title: '',
    description: '',
    // TODO not supported yet
    symmetrical: false,

    // UX State
    cursor: null,
    cursorDirection: 'ACROSS',
    menuCell: null,
    cellSize: 30
});



/**
 * Resize the grid according to new width and height.
 */
export const rResize = (state, action) => state.withMutations(mutState => {
    mutState.set('width', action.width);
    mutState.set('height', action.height);
    // Update the grid
    const { clues, content } = updateGridContent(
        mutState.get('content'),
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

    // Apply any changes set in the action
    if (action.cellType !== undefined) {
        cell = cell.set('type', action.cellType);
    }
    if (action.annotation !== undefined) {
        cell = cell.set('annotation', action.annotation);
    }
    if (action.value !== undefined) {
        cell = cell.set('value', action.value);
    }

    content = content.set(index, cell);

    // Update the grid
    // TODO full update is expensive and not always necessary.
    const updates = updateGridContent(
        content,
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
}


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
    return state.set('clues', clues.set(index, clue.set(direction, value)));
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
    const updated = updateGridContent(content, height, width);
    return state.withMutations(mutState => {
        return mutState
            .set('content', updated.content)
            .set('clues', updated.clues)
            .set('width', width)
            .set('height', height);
    });
};


/**
 * Grid state reducer. Applies action transformations to state.
 */
export const grid = (state = DEFAULT_GRID, action) => {
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
        default:
            return state;
    }
};
