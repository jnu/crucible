/**
 * Grid clue/answer direction.
 */
export type Direction = 'DOWN' | 'ACROSS';

/**
 * Toggle the option that forces symmetry when building the grid.
 */
export const toggleSymmetricalGrid = () => ({
    type: 'TOGGLE_SYMMETRICAL_GRID'
});

/**
 * Set the clue/answer direction to the given value.
 */
export const setDirection = (direction: Direction) => ({
    type: 'SET_CURSOR_DIRECTION',
    direction
});

/**
 * Focus on the cell with the given index.
 */
export const focusCell = (index: number) => ({
    type: 'SELECT_CELL',
    index
});

/**
 * Move the puzzle cell cursor a number of cells in the current direction.
 */
export const moveCursor = (delta: number) => ({
    type: 'MOVE_CURSOR',
    delta
});

/**
 * Request a context menu for the cell at the given index.
 */
export const requestCellContext = (index: number) => ({
    type: 'SHOW_MENU',
    index
});

/**
 * Hide the currently visible context menu.
 */
export const hideCellContext = () => ({
    type: 'HIDE_MENU'
});
