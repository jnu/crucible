import type {Direction} from './gridMeta';
import {moveCursor} from './gridMeta';
import {fill} from '../lib/gridiron';
import type {IProgressStats} from '../lib/gridiron';
import type {CellType, Cell} from '../lib/crux';
import type {Dispatch, GetState} from '../store';
import type {WordBank} from '../lib/readcross/WordBank';

/**
 * Updated information to apply to a cell.
 */
export type CellUpdates = Readonly<
  Partial<{
    type: CellType;
    annotation: string;
    value: string;
  }>
>;

/**
 * Resize the puzzle grid to the given dimensions.
 */
export const resize = (width: number, height: number) =>
  ({
    type: 'RESIZE',
    width,
    height,
  } as const);

/**
 * Action to resize puzzle.
 */
export type Resize = ReturnType<typeof resize>;

/**
 * Update the cell at the given index with the given character and annotation.
 */
export const updateCell = (index: number, updates: CellUpdates) =>
  ({
    type: 'SET_CELL',
    index,
    cellType: updates.type,
    annotation: updates.annotation,
    value: updates.value,
  } as const);

/**
 * Action to update a cell in the puzzle.
 */
export type SetCell = ReturnType<typeof updateCell>;

/**
 * Action to begin autofill.
 */
const AUTO_FILL_GRID_START = {type: 'AUTO_FILL_GRID_START'} as const;

/**
 * Type of action to begin autofill.
 */
export type AutoFillGridStart = typeof AUTO_FILL_GRID_START;

/**
 * Update the UI with stats about auto-fill progress.
 */
const autoFillGridStatsUpdate = (stats: IProgressStats) =>
  ({
    type: 'AUTO_FILL_STATS_UPDATE',
    stats,
  } as const);

/**
 * Action to update autofill progress.
 */
export type AutoFillGridStatsUpdate = ReturnType<
  typeof autoFillGridStatsUpdate
>;

/**
 * Pass on a fully filled grid.
 */
const autoFillGridDone = (content: ReadonlyArray<Cell>) =>
  ({
    type: 'AUTO_FILL_GRID_DONE',
    content,
  } as const);

/**
 * Action to signal finished auto-fill process with results.
 */
export type AutoFillGridDone = ReturnType<typeof autoFillGridDone>;

/**
 * Pass on an error that occurred during auto-fill.
 */
const autoFillGridError = (error: Error) =>
  ({
    type: 'AUTO_FILL_GRID_ERROR',
    error,
  } as const);

/**
 * Action to signal an error occurred during auto-fill.
 */
export type AutoFillGridError = ReturnType<typeof autoFillGridError>;

/**
 * [Async] fill in grid automatically, with regard to initial constraints.
 */
export const autoFillGrid = (wordList: {lists: {[key: string]: WordBank}}) => {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch(AUTO_FILL_GRID_START);
    const gridContent = getState().grid.content;
    fill(gridContent, wordList.lists, (stats) =>
      dispatch(autoFillGridStatsUpdate(stats)),
    )
      .then((filled) => {
        dispatch(autoFillGridDone(filled));
      })
      .catch((error) => {
        dispatch(autoFillGridError(error));
      });
  };
};

/**
 * Dismiss an error that occurred while auto-filling grid.
 */
export const autoFillGridDismissError = () =>
  ({
    type: 'AUTO_FILL_GRID_DISMISS_ERROR',
  } as const);

/**
 * Dismiss an error that occurred during autofill.
 */
export type AutoFillGridDismissError = ReturnType<
  typeof autoFillGridDismissError
>;

/**
 * Update the clue at the given index/direction with the given value.
 */
export const updateClue = (type: Direction, index: number, newValue: string) =>
  ({
    type: 'UPDATE_CLUE',
    direction: type,
    index,
    value: newValue,
  } as const);

/**
 * Action to update a clue.
 */
export type UpdateClue = ReturnType<typeof updateClue>;

/**
 * Simultaneously move the puzzle cursor and apply updates to that cell.
 */
export const moveCursorAndUpdate = (delta: number, updates: CellUpdates) => {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch(moveCursor(delta));
    const {grid} = getState();
    if (grid.cursor !== null) {
      dispatch(updateCell(grid.cursor, updates));
    }
  };
};

/**
 * Set puzzle metadata.
 */
export const updatePuzzleInfo = (key: string, value: string) =>
  ({
    type: 'UPDATE_PUZZLE_INFO',
    key,
    value,
  } as const);

/**
 * Action to update puzzle metadata.
 */
export type UpdatePuzzleInfo = ReturnType<typeof updatePuzzleInfo>;
