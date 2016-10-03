import Immutable from 'immutable';


/**
 * TODO:
 *     - Symmetrical block entering
 *     - Auto-adjust clues on block entering
 *     - Explore auto-adjusting other things on block entering
 */


/**
 * Grow/shrink the grid based on new size, filling in empty cells as needed.
 */
export const updateGridContent = (content, height, width) => {
    const clues = [];
    let prevRow = null;
    content = content
            .setSize(height)
            .withMutations(mutContent => {
                // Fill in missing rows
                for (let i = 0; i < height; i++) {
                    // Set next row metadata
                    const hasNextRow = i < (height - 1);
                    const nextRow = content.get(i + 1);
                    const row = (content.get(i) || Immutable.List())
                        .setSize(width)
                        .withMutations(mutRow => {
                            // Initialize type as 'BLOCK' - it is really the
                            // edge, but for the purposes of clues this is fine.
                            let prevColType = 'BLOCK';
                            // Fill in missing cells
                            for (let j = 0; j < width; j++) {
                                const cell = mutRow.get(j);
                                // Next adjacent cell meta data
                                const hasNextCell = j < (width - 1);
                                const nextCell = mutRow.get(j + 1);

                                // Check if cell has an associated clue
                                const canHaveClue = !cell || cell.get('type') === 'CONTENT';
                                const hasDownClue = canHaveClue &&
                                    // Previous row must not have content
                                    (!prevRow || prevRow.get(j).get('type') === 'BLOCK') &&
                                    // Next row must have content. In reality,
                                    // the next row might not have been created
                                    // in memory yet, in which case we can
                                    // assume it will have content.
                                    (hasNextRow && (!nextRow || nextRow.get(j).get('type') !== 'BLOCK'));
                                const hasAcrossClue = canHaveClue &&
                                    // Previous row must not have content
                                    (!prevColType || prevColType === 'BLOCK') &&
                                    // Next row must have content. Like with
                                    // rows, the next cell might not exist yet,
                                    // in which case we can assume it will have
                                    // content.
                                    (hasNextCell && (!nextCell || nextCell.get('type') !== 'BLOCK'));
                                // Check if the cell has any clue at all.
                                const hasClue = hasDownClue || hasAcrossClue;

                                if (hasClue) {
                                    clues.push(Immutable.Map({
                                        down: hasDownClue ? '' : null,
                                        across: hasAcrossClue ? '' : null,
                                        row: i,
                                        col: j
                                    }));
                                }

                                // Update cell in state
                                if (!cell) {
                                    // Create a new cell
                                    mutRow.set(j, Immutable.Map({
                                        type: 'CONTENT',
                                        annotation: null,
                                        value: '',
                                        startOfWord: hasClue,
                                        clueIdx: clues.length - 1,
                                        clueAcross: hasAcrossClue,
                                        clueDown: hasDownClue
                                    }));
                                } else {
                                    // Update existing cell with new clue info
                                    mutRow.set(
                                        j,
                                        cell.set('startOfWord', hasClue)
                                            .set('clueIdx', clues.length - 1)
                                            .set('clueAcross', hasAcrossClue)
                                            .set('clueDown', hasDownClue)
                                    )
                                }

                                // Track this cell for next iteration
                                prevColType = cell ? cell.get('type') : 'CONTENT';
                            }
                            return mutRow;
                        });
                    // Update row in state
                    mutContent.set(i, row);
                    // Track this row for next iteration
                    prevRow = row;
                }
                return mutContent;
            });
    return { clues: Immutable.List(clues), content };
};


/**
 * Create a row/col Map that's within the grid boundaries, defined in State.
 */
export const snapToBounds = ({ state, row, col }) => {
    return Immutable.Map({
        row: Math.max(0, Math.min(row, state.get('height') - 1)),
        col: Math.max(0, Math.min(col, state.get('width') - 1))
    });
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
 * Default content grid. TODO: flatten.
 */
const DEFAULT_GRID_INFO = updateGridContent(Immutable.List(), DEFAULT_WIDTH, DEFAULT_HEIGHT);

/**
 * Default grid state.
 */
const DEFAULT_GRID = Immutable.fromJS({
    // Grid state
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    // TODO flatten content for performance.
    content: DEFAULT_GRID_INFO.content,
    clues: DEFAULT_GRID_INFO.clues,

    // Meta state
    title: '',
    description: '',
    // TODO not supported yet
    symmetrical: false,

    // UX State
    selectedCell: null,
    selectedDirection: 'ACROSS',
    menuCell: null,
    cellSize: 30
});


/**
 * Grid state reducer. Applies action transformations to state.
 */
export const grid = (state = DEFAULT_GRID, action) => {
    switch (action.type) {
        case 'RESIZE': {
            return state.withMutations(mutState => {
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
        }
        case 'SET_CELL': {
            // TODO simpler deep mutation?
            let content = state.get('content');
            let row = content.get(action.row);
            let col = row.get(action.col);

            // Apply any changes set in the action
            if (action.cellType !== undefined) {
                col = col.set('type', action.cellType);
            }
            if (action.annotation !== undefined) {
                col = col.set('annotation', action.annotation);
            }
            if (action.value !== undefined) {
                col = col.set('value', action.value);
            }

            row = row.set(action.col, col);
            content = content.set(action.row, row);

            // Update the grid
            const updates = updateGridContent(
                content,
                state.get('height'),
                state.get('width')
            );
            return state
                .set('content', updates.content)
                .set('clues', updates.clues);
        }
        case 'SELECT_CELL': {
            const { row, col } = action;
            return state.set('selectedCell', snapToBounds({ state, row, col }));
        }
        case 'SET_SELECT_DIRECTION': {
            const { direction } = action;
            if (direction !== 'ACROSS' || direction !== 'DOWN') {
                if (DEBUG) {
                    console.error('Illegal: unknown direction', direction);
                }
                return state;
            }
            return state.set('selectedDirection', action.direction);
        }
        case 'HIDE_MENU': {
            return state.set('menuCell', null);
        }
        case 'SHOW_MENU': {
            const { row, col } = action;
            return state.set('menuCell', snapToBounds({ state, row, col }));
        }
        default:
            return state;
    }
};
