/**
 * Grid clue/answer direction.
 */
export enum Direction {
  Down = 'DOWN',
  Across = 'ACROSS',
}

/**
 * Toggle whether grid structure can be edited (i.e., black squares toggled).
 */
export const toggleGridLock = () =>
  ({
    type: 'TOGGLE_GRID_LOCK',
  } as const);

/**
 * Action to toggle whether grid is locked.
 */
export type ToggleGridLock = ReturnType<typeof toggleGridLock>;

/**
 * Toggle the option that forces symmetry when building the grid.
 */
export const toggleSymmetricalGrid = () =>
  ({
    type: 'TOGGLE_SYMMETRICAL_GRID',
  } as const);

/**
 * Action to turn on/off enforced symmetry.
 */
export type ToggleSymmetricalGrid = ReturnType<typeof toggleSymmetricalGrid>;

/**
 * Set the clue/answer direction to the given value.
 */
export const setDirection = (direction: Direction) =>
  ({
    type: 'SET_CURSOR_DIRECTION',
    direction,
  } as const);

/**
 * Action to set the direction of the cursor.
 */
export type SetCursorDirection = ReturnType<typeof setDirection>;

/**
 * Focus on the cell with the given index.
 */
export const focusCell = (index: number) =>
  ({
    type: 'SELECT_CELL',
    index,
  } as const);

/**
 * Action to focus a certain cell.
 */
export type SelectCell = ReturnType<typeof focusCell>;

/**
 * Move the puzzle cell cursor a number of cells in the current direction.
 */
export const moveCursor = (delta: number) =>
  ({
    type: 'MOVE_CURSOR',
    delta,
  } as const);

/**
 * Action to move the cursor in the grid.
 */
export type MoveCursor = ReturnType<typeof moveCursor>;

/**
 * Request a context menu for the cell at the given index, at the given coords.
 */
export const requestCellContext = (index: number, x: number, y: number) =>
  ({
    type: 'SHOW_MENU',
    index,
    x,
    y,
  } as const);

/**
 * Action to show a context menu for a given cell.
 */
export type ShowMenu = ReturnType<typeof requestCellContext>;

/**
 * Hide the currently visible context menu.
 */
export const hideCellContext = () =>
  ({
    type: 'HIDE_MENU',
  } as const);

/**
 * Action to hide the context menu for a cell.
 */
export type HideMenu = ReturnType<typeof hideCellContext>;
