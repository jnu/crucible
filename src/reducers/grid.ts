import UUID from 'pure-uuid';

import {isDefined} from '../lib/isDefined';
import {fill} from '../lib/gridiron';
import type {IProgressStats} from '../lib/gridiron';
import {CellType, Direction} from '../lib/crux';
import type {Cell, Clue} from '../lib/crux';
import type {
  ToggleSymmetricalGrid,
  ToggleGridLock,
  SelectCell,
  SetCursorDirection,
  HideMenu,
  ShowMenu,
  MoveCursor,
} from '../actions/gridMeta';
import type {
  Resize,
  SetCell,
  UpdateClue,
  UpdatePuzzleInfo,
  AutoFillGridDismissError,
  AutoFillGridStart,
  AutoFillGridDone,
  AutoFillGridStatsUpdate,
  AutoFillGridError,
} from '../actions/gridSemantic';
import type {ReplaceGrid} from '../actions/storage';
import type {Action} from '../actions';

/**
 * TODO:
 *     - Auto-adjust clues on block entering
 *     - Explore auto-adjusting other things on block entering
 */

/**
 * Augmented representation of the clue.
 */
export type GridClue = Clue & {
  acrossStartIdx: number | null;
  downStartIdx: number | null;
};

/**
 * Supplemental fields for working with cells in the grid.
 */
export type GridCellNotes = {
  startOfWord?: boolean;
  startClueIdx?: number;
  acrossWord?: number;
  downWord?: number;
  annotation?: string;
  acrossWordLength?: number;
  downWordLength?: number;
};

/**
 * Augmented representation of the cell.
 */
export type GridCell = Cell & GridCellNotes;

/**
 * Represent state of the grid store.
 */
export type GridState = Readonly<{
  width: number;
  height: number;
  content: GridCell[];
  clues: GridClue[];
  title: string;
  author: string;
  description: string;
  copyright: string;
  dateCreated: number;
  lastModified: number;
  symmetrical: boolean;
  id: string;
  cursor: number | null;
  cursorDirection: Direction;
  menuCell: number | null;
  menuX: number | null;
  menuY: number | null;
  cellSize: number;
  autoFilling: boolean;
  autoFillStatus: IProgressStats | null;
  autoFillError: Error | null;
  locked: boolean;
}>;

/**
 * Represent the state of a block (black) cell.
 *
 * All block cells share the same state.
 */
const BLOCK_CELL = {
  type: CellType.Block,
  value: null,
} as const;

/**
 * Structure to help figure out at which cell a clue begins.
 */
type ClueProjection = {[idx: number]: number};

/**
 * Grow/shrink the grid based on new size, filling in empty cells as needed.
 *
 * This also adds annotations to the cells to aid rendering.
 */
export const updateGridContent = (
  content: ReadonlyArray<GridCell>,
  clues: ReadonlyArray<Clue>,
  height: number,
  width: number,
) => {
  const n = height * width;
  const clueAcrossProjection: ClueProjection = {};
  const clueDownProjection: ClueProjection = {};
  const newClues: GridClue[] = [];
  const newContent = new Array<GridCell>(n);

  // Fill in missing cells and add metadata.
  const wordLengthCounters = {
    across: new Map<number, number>(),
    down: new Map<number, number>(),
  };
  const rowAboveWords = new Array(width);
  let cellLeftWord: number | null = null;
  let colIdx = 0;
  let rightCell = null;
  let rightCellType = null;

  for (let i = 0; i < n; i++) {
    const cell = rightCell || content[i];
    const cellType = rightCellType || cell?.type || CellType.Content;

    // Next adjacent cell meta data
    const hasRightCell = colIdx < width - 1;
    rightCell = hasRightCell ? content[i + 1] : null;
    rightCellType = rightCell?.type;

    const belowCellIdx = i + width;
    const hasBelowCell = belowCellIdx < n - 1;
    const belowCell = hasBelowCell ? content[belowCellIdx] : null;
    const belowCellType = belowCell?.type;

    // Most of the interesting things happen with content cells.
    if (cellType === CellType.Content) {
      // Determine the number of this across word. It may not
      // have a number depending on its surroundings. Or, the
      // number may be the same as the previous word. Or, it
      // may be a new number.
      const firstOpenAcross: boolean = !isDefined(cellLeftWord);
      const nextIsOpenAcross =
        hasRightCell && (!rightCellType || rightCellType === CellType.Content);
      const hasAcrossClue = firstOpenAcross && nextIsOpenAcross;
      const acrossWord: number =
        (nextIsOpenAcross
          ? firstOpenAcross
            ? newClues.length
            : cellLeftWord
          : cellLeftWord) || 0;
      // Tally the number of times this word is referenced ... that will end
      // up being the length of the word, which is useful metadata.
      wordLengthCounters.across.set(
        acrossWord,
        (wordLengthCounters.across.get(acrossWord) || 0) + 1,
      );

      // Do same determination for down words.
      const cellAboveWord = rowAboveWords[colIdx];
      const firstOpenDown = !isDefined(cellAboveWord);
      const nextIsOpenDown =
        hasBelowCell && (!belowCellType || belowCellType === CellType.Content);
      const hasDownClue = firstOpenDown && nextIsOpenDown;
      const downWord = nextIsOpenDown
        ? firstOpenDown
          ? newClues.length
          : cellAboveWord
        : cellAboveWord;
      wordLengthCounters.down.set(
        downWord,
        (wordLengthCounters.down.get(downWord) || 0) + 1,
      );

      // Useful derived props
      const startOfWord = hasAcrossClue || hasDownClue;
      const startClueIdx = hasAcrossClue
        ? acrossWord
        : hasDownClue
        ? downWord
        : null;

      let currentAcrossWord = null;
      let currentDownWord = null;

      // Now create/update the cell with this info.
      if (cell) {
        // Update an existing cell.
        currentAcrossWord = cell.acrossWord;
        currentDownWord = cell.downWord;
        newContent[i] = {
          type: CellType.Content,
          value: cell.value || '',
          acrossWord,
          downWord,
          startOfWord,
          startClueIdx,
        } as const;

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
        newContent[i] = {
          type: CellType.Content,
          annotation: undefined,
          value: '',
          acrossWord,
          downWord,
          startOfWord,
          startClueIdx,
        };
      }

      // Add a new clue if necessary
      if (hasAcrossClue || hasDownClue) {
        const acrossClue = hasAcrossClue
          ? {across: '', acrossStartIdx: i}
          : {across: null, acrossStartIdx: null};
        const downClue = hasDownClue
          ? {down: '', downStartIdx: i}
          : {down: null, downStartIdx: null};

        newClues.push({...acrossClue, ...downClue});
      }

      // Save state for next iteration
      cellLeftWord = acrossWord;
      rowAboveWords[colIdx] = downWord;
    } else {
      // When the cell is a BLOCK, clean up state
      newContent[i] = BLOCK_CELL;
      cellLeftWord = null;
      rowAboveWords[colIdx] = null;
    }

    // Update pointer
    if (colIdx < width - 1) {
      colIdx += 1;
    } else {
      colIdx = 0;
      cellLeftWord = null;
    }
  }

  // Add word length metadata back into the grid.
  for (let i = 0; i < n; i++) {
    const cell = newContent[i];
    if (cell.type === CellType.Block) {
      continue;
    }

    cell.acrossWordLength =
      wordLengthCounters.across.get(cell.acrossWord || 0) || 0;
    cell.downWordLength = wordLengthCounters.down.get(cell.downWord || 0) || 0;
  }

  // Project old clues into new clues. There are some tricky cases here where
  // clues can just disappear, e.g. if the old grid's CONTENT squares have
  // been shrunk to a single cell width. There might be a better way to
  // handle these, but for now they are just dropped.
  clues.forEach((clue, i) => {
    if (clueAcrossProjection.hasOwnProperty(i)) {
      const newIdx = clueAcrossProjection[i];
      const newClue = newClues[newIdx];
      if (newClue) {
        newClues[newIdx] = {...newClue, across: clue.across || ''};
      }
    }

    if (clueDownProjection.hasOwnProperty(i)) {
      const newIdx = clueDownProjection[i];
      const newClue = newClues[newIdx];
      if (newClue) {
        newClues[newIdx] = {...newClue, down: clue.down || ''};
      }
    }
  });

  return {clues: newClues, content: newContent};
};

/**
 * Create a row/col Map that's within the grid boundaries, defined in State.
 */
export const snapToBounds = ({
  state,
  index,
}: {
  state: GridState;
  index: number;
}) => {
  const max = state.content.length;
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
  [],
  [],
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
);

/**
 * Default grid state.
 */
const createNewGrid = (): GridState => {
  const ts = Date.now();
  const id = new UUID(4);
  return {
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
    id: id.format(),

    // UX State
    cursor: null,
    cursorDirection: Direction.Across,
    menuCell: null,
    menuX: null,
    menuY: null,
    cellSize: 30,
    locked: false,

    // Autofill state
    autoFilling: false,
    autoFillStatus: null,
    autoFillError: null,
  };
};

/**
 * Toggle whether grid structure is locked.
 */
export const rToggleGridLock = (state: GridState, _action: ToggleGridLock) => {
  return {
    ...state,
    locked: !state.locked,
  };
};

/**
 * Resize the grid according to new width and height.
 */
export const rResize = (state: GridState, action: Resize) => {
  // Update the grid
  const {clues, content} = updateGridContent(
    state.content,
    state.clues,
    action.height,
    action.width,
  );

  return {
    ...state,
    width: action.width,
    height: action.height,
    content,
    clues,
  };
};

/**
 * Update the cell at the given index with the given parameters.
 */
export const rSetCell = (state: GridState, action: SetCell) => {
  const newContent = state.content.slice();
  const {index} = action;
  const newCell = {...newContent[index]};

  const {cellType, annotation, value} = action;

  // Apply any changes set in the action
  if (isDefined(cellType)) {
    newCell.type = cellType;
    // Apply symmetrical cell as well
    if (state.symmetrical) {
      const contentMid = (newContent.length - 1) / 2;
      const mirrorIdx = ~~(contentMid + (contentMid - index));
      const mirrorCell = {...newContent[mirrorIdx]};
      mirrorCell.type = cellType;
      newContent[mirrorIdx] = mirrorCell;
    }
  }

  if (annotation !== undefined) {
    newCell.annotation = annotation;
  }

  if (value !== undefined) {
    newCell.value = value;
  }

  newContent[index] = newCell;

  // Update the grid
  // TODO full update is expensive and not always necessary.
  const updates = updateGridContent(
    newContent,
    state.clues,
    state.height,
    state.width,
  );

  return {...state, ...updates};
};

/**
 * Move the cursor to the designated cell.
 */
export const rSelectCell = (state: GridState, action: SelectCell) => ({
  ...state,
  cursor: snapToBounds({state, index: action.index}),
});

/**
 * Set the cursor direction.
 */
export const rSetCursorDirection = (
  state: GridState,
  action: SetCursorDirection,
) => {
  const {direction} = action;
  if (direction !== Direction.Across && direction !== Direction.Down) {
    if (DEBUG) {
      console.error(`Illegal: unknown direction: ${direction}`);
    }
    return state;
  }
  return {...state, cursorDirection: direction};
};

/**
 * Hide the context menu for the designated cell.
 */
export const rHideMenu = (state: GridState, _action: HideMenu) => ({
  ...state,
  menuCell: null,
  menuX: null,
  menuY: null,
});

/**
 * Show the context menu for the designated cell.
 */
export const rShowMenu = (state: GridState, action: ShowMenu) => ({
  ...state,
  menuCell: snapToBounds({state, index: action.index}),
  menuX: action.x,
  menuY: action.y,
});

/**
 * Update the value of a clue given the direction, its index, and a new value.
 */
export const rUpdateClue = (state: GridState, action: UpdateClue) => {
  const {value, index, direction} = action;
  const clues = state.clues.slice();
  const clue = {...clues[index]};
  clue[direction.toLowerCase() as 'across' | 'down'] = value;
  clues[index] = clue;
  return {...state, clues};
};

/**
 * Move the cursor the amount specified by the delta in the direction currently
 * specified in state.
 */
export const rMoveCursor = (state: GridState, action: MoveCursor) => {
  const {delta} = action;
  if (!delta || state.cursor === null) {
    return state;
  }
  const {width, height, cursorDirection: direction, cursor} = state;

  // Horizontal movement
  if (direction === Direction.Across) {
    const startCol = cursor % width;
    // Determine if move will keep cursor in same row. For now,
    // disallow any move that would require wrapping.
    const canMove =
      delta < 0 ? Math.abs(delta) <= startCol : startCol + delta < width;
    if (!canMove) {
      return state;
    }
    return {...state, cursor: cursor + delta};
  }
  // Vertical movement
  else {
    const startRow = ~~(cursor / width);
    const canMove =
      delta < 0 ? Math.abs(delta) <= startRow : startRow + delta < height;
    if (!canMove) {
      return state;
    }
    return {...state, cursor: cursor + delta * width};
  }
};

/**
 * Create a new grid and merge the given state into it (if any).
 */
export const rReplaceGrid = (state: GridState, action: ReplaceGrid) => {
  const {grid, id} = action;
  let newGrid: Partial<GridState> = {};

  if (grid) {
    const {content, clues} = updateGridContent(
      grid.content,
      grid.clues,
      grid.height,
      grid.width,
    );

    // The update procedure doesn't do a good job migrating clues when
    // no metadata is present yet (which it isn't when restoring from
    // a file). Just overwrite for now. TODO fix update procedure.
    // updated.set('clues', originalClues);
    newGrid = {...grid, content, clues};
  } else {
    newGrid = createNewGrid();
  }

  return {...state, ...newGrid, id, locked: true};
};

/**
 * Toggle symmetrical block constraint.
 */
export const rToggleSymmetricalGrid = (
  state: GridState,
  _action: ToggleSymmetricalGrid,
) => {
  return {...state, symmetrical: !state.symmetrical};
};

/**
 * Set puzzle info key (e.g., action.key="title"; action.value="New title")
 */
export const rUpdatePuzzleInfo = (
  state: GridState,
  action: UpdatePuzzleInfo,
) => {
  return {...state, [action.key]: action.value};
};

/**
 * Mark the start of the auto-fill process.
 */
export const rAutoFillGridStart = (
  state: GridState,
  _action: AutoFillGridStart,
) => {
  return {
    ...state,
    autoFilling: true,
    autoFillStatus: null,
    autoFillError: null,
  };
};

/**
 * Update summary stats about auto-fill progress.
 */
export const rAutoFillGridUpdate = (
  state: GridState,
  action: AutoFillGridStatsUpdate,
) => {
  return {...state, autoFillStatus: action.stats};
};

/**
 * Fill the grid randomly with words from the wordlists.
 */
export const rAutoFillGridDone = (
  state: GridState,
  action: AutoFillGridDone,
) => {
  return {
    ...state,
    content: action.content.slice(),
    autoFilling: false,
    autoFillStatus: null,
    autoFillError: null,
  };
};

/**
 * Mark an error that occurred while auto-filling.
 */
export const rAutoFillGridError = (
  state: GridState,
  action: AutoFillGridError,
) => {
  return {
    ...state,
    autoFilling: false,
    autoFillStatus: null,
    autoFillError: action.error,
  };
};

/**
 * Dismiss an error that occurred while auto-filling grid.
 */
export const rAutoFillGridDismissError = (
  state: GridState,
  _action: AutoFillGridDismissError,
) => {
  return {...state, autoFillError: null};
};

/**
 * Grid state reducer. Applies action transformations to state.
 */
const dispatchGridAction = (state: GridState, action: Action): GridState => {
  switch (action.type) {
    case 'TOGGLE_GRID_LOCK':
      return rToggleGridLock(state, action);
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
    case 'REPLACE_GRID':
      return rReplaceGrid(state, action);
    case 'TOGGLE_SYMMETRICAL_GRID':
      return rToggleSymmetricalGrid(state, action);
    case 'UPDATE_PUZZLE_INFO':
      return rUpdatePuzzleInfo(state, action);
    case 'AUTO_FILL_GRID_START':
      return rAutoFillGridStart(state, action);
    case 'AUTO_FILL_STATS_UPDATE':
      return rAutoFillGridUpdate(state, action);
    case 'AUTO_FILL_GRID_DONE':
      return rAutoFillGridDone(state, action);
    case 'AUTO_FILL_GRID_ERROR':
      return rAutoFillGridError(state, action);
    case 'AUTO_FILL_GRID_DISMISS_ERROR':
      return rAutoFillGridDismissError(state, action);
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
export const grid = (state = createNewGrid(), action: Action): GridState => {
  const newState = dispatchGridAction(state, action);
  // Update last modified time as necessary
  if (newState !== state) {
    return {...newState, lastModified: Date.now()};
  } else {
    return newState;
  }
};
