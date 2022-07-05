import UUID from 'pure-uuid';

import * as crux from '../lib/crux';
import {storageClient} from '../lib/index';
import type {AutoSaveState} from '../reducers/autosave';
import type {Dispatch, GetState, State} from '../store';
import type {CruxPuzzle} from '../lib/crux';
import type {GridState} from '../reducers/grid';

/**
 * Partial value of a puzzle used in the index.
 */
export type PuzzleIndexItem = {
  id: string;
  title: string;
  description: string;
};

/**
 * Get a list of grid templates.
 */
export const fetchGridStateIndex = () => {
  return (dispatch: Dispatch, _getState: GetState) => {
    dispatch(REQUEST_GRID_SHAPE_INDEX);
    storageClient.index<SavedGridTemplate>('gridShape').then((index) => {
      dispatch(receiveGridShapeIndex(index));
    });
  };
};

/**
 * Start fetching template index.
 */
const REQUEST_GRID_SHAPE_INDEX = {type: 'REQUEST_GRID_SHAPE_INDEX'} as const;

/**
 * Action to fetch template index.
 */
export type RequestGridShapeIndex = typeof REQUEST_GRID_SHAPE_INDEX;

/**
 * Finish fetching template index.
 */
const receiveGridShapeIndex = (index: ReadonlyArray<SavedGridTemplate>) =>
  ({
    type: 'RECEIVE_GRID_SHAPE_INDEX',
    data: index,
  } as const);

/**
 * Action to finish fetching grid template index.
 */
export type ReceiveGridShapeIndex = ReturnType<typeof receiveGridShapeIndex>;

/**
 * Start an export of the grid template.
 */
const REQUEST_EXPORT_GRID_SHAPE = {type: 'REQUEST_EXPORT_GRID_SHAPE'} as const;

/**
 * Action to start an export of the grid template.
 */
export type RequestExportGridShape = typeof REQUEST_EXPORT_GRID_SHAPE;

/**
 * Receive a grid template.
 */
const RECEIVE_EXPORT_GRID_SHAPE = {type: 'RECEIVE_EXPORT_GRID_SHAPE'} as const;

/**
 * Action to receive a grid template.
 */
export type ReceiveExportGridShape = typeof RECEIVE_EXPORT_GRID_SHAPE;

/**
 * Save the current grid template.
 */
export const exportGridShape = (name: string) => {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch(REQUEST_EXPORT_GRID_SHAPE);
    const {grid} = getState();
    const {width, height} = grid;
    // Create empty copy of content and write.
    const content = grid.content.map((cell, i) => {
      if (cell.type === 'BLOCK') {
        return {type: cell.type, startOfWord: false};
      } else {
        return {
          type: cell.type,
          startOfWord: i === 0,
          startClueIdx: 0,
          acrossWord: 0,
          downWord: 0,
          value: '',
        };
      }
    });
    const bitmap = crux.write({
      content,
      clues: [],
      width,
      height,
      author: '',
      title: '',
      copyright: '',
      description: '',
      dateCreated: 0,
      lastModified: 0,
    });
    const uuid = new UUID(4);
    storageClient
      .save('gridShape', uuid.format(), {name, bitmap})
      .then(() => {
        dispatch(RECEIVE_EXPORT_GRID_SHAPE);
      })
      .catch((error) => {
        dispatch(RECEIVE_EXPORT_GRID_SHAPE);
        // TODO handle this
        console.error('failed to export grid shape:', error);
      });
  };
};

/**
 * Load a saved grid.
 */
export const loadBitmap = (bitmap: string, id: string | null = null) => {
  const grid = crux.read(bitmap);
  return {
    type: 'REPLACE_GRID',
    grid,
    id,
  } as const;
};

/**
 * Load a clear grid.
 */
export const loadEmptyPuzzle = (uuid?: string) =>
  ({
    type: 'REPLACE_GRID',
    id: uuid || new UUID(4).format(),
  } as const);

/**
 * Action that clears and/or replaces the current grid.
 */
export type ReplaceGrid = ReturnType<typeof loadBitmap> &
  ReturnType<typeof loadEmptyPuzzle>;

/**
 * Serialized grid template.
 */
export type SavedGridTemplate = Readonly<{
  key: string;
  name: string;
  bitmap: string;
}>;

/**
 * Load a grid template.
 */
export const importGridShape = (
  uuid: string,
  navigate: (s: string) => void,
) => {
  return (dispatch: Dispatch, _getState: GetState) => {
    dispatch(REQUEST_IMPORT_GRID_SHAPE);
    storageClient
      .load<SavedGridTemplate>('gridShape', uuid)
      .then(({bitmap}) => {
        dispatch(RECEIVE_IMPORT_GRID_SHAPE);
        const newId = new UUID(4).format();
        dispatch(loadBitmap(bitmap, newId));
        navigate(newId);
      })
      .catch((error) => {
        dispatch(RECEIVE_IMPORT_GRID_SHAPE);
        // TODO handle this
        console.error('failed to load grid shape:', error);
      });
  };
};

/**
 * Request to load a template.
 */
const REQUEST_IMPORT_GRID_SHAPE = {type: 'REQUEST_IMPORT_GRID_SHAPE'} as const;

/**
 * Action to request to load a template.
 */
export type RequestImportGridShape = typeof REQUEST_IMPORT_GRID_SHAPE;

/**
 * Finish loading a template.
 */
const RECEIVE_IMPORT_GRID_SHAPE = {type: 'RECEIVE_IMPORT_GRID_SHAPE'} as const;

/**
 * Action to finish loading a template.
 */
export type ReceiveImportGridShape = typeof RECEIVE_IMPORT_GRID_SHAPE;

/**
 * Fetch the puzzle index.
 */
const REQUEST_PUZZLE_INDEX = {type: 'REQUEST_PUZZLE_INDEX'} as const;

/**
 * Action to fetch puzzle index.
 */
export type RequestPuzzleIndex = typeof REQUEST_PUZZLE_INDEX;

/**
 * Receive the puzzle index.
 */
const receivePuzzleIndexSuccess = (data: ReadonlyArray<PuzzleIndexItem>) =>
  ({
    type: 'RECEIVE_PUZZLE_INDEX_SUCCESS',
    data,
  } as const);

/**
 * Action to receive the puzzle index.
 */
export type ReceivePuzzleIndexSuccess = ReturnType<
  typeof receivePuzzleIndexSuccess
>;

/**
 * Failed to receive puzzle index.
 */
const receivePuzzleIndexError = (error: Error) =>
  ({
    type: 'RECEIVE_PUZZLE_INDEX_ERROR',
    error,
  } as const);

/**
 * Action to signal error receiving puzzle index.
 */
export type ReceivePuzzleIndexError = ReturnType<
  typeof receivePuzzleIndexError
>;

/**
 * Fetch all puzzles (TODO paging)
 */
export const fetchPuzzleIndex = () => {
  return (dispatch: Dispatch, _getState: GetState) => {
    dispatch(REQUEST_PUZZLE_INDEX);
    storageClient
      .index<SavedPuzzle>('puzzle')
      .then((index) => {
        // TODO Crux should have a fast meta-data parsing function,
        // since we don't need to parse the whole puzzle here, and
        // waste time/memory.
        const data = index.map(({bitmap, key}) => {
          const puz = crux.read(bitmap);
          return {...puz, id: key} as PuzzleIndexItem;
        });
        dispatch(receivePuzzleIndexSuccess(data));
      })
      .catch((error) => dispatch(receivePuzzleIndexError(error)));
  };
};

/**
 * Start loading a puzzle.
 */
const REQUEST_PUZZLE = {type: 'REQUEST_PUZZLE'} as const;

/**
 * Action to start loading puzzle.
 */
export type RequestPuzzle = typeof REQUEST_PUZZLE;

/**
 * Finish loading a puzzle.
 */
const RECEIVE_PUZZLE_SUCCESS = {type: 'RECEIVE_PUZZLE_SUCCESS'} as const;

/**
 * Action to finish loading puzzle.
 */
export type ReceivePuzzleSuccess = typeof RECEIVE_PUZZLE_SUCCESS;

/**
 * Fail to receive a puzzle.
 */
const receivePuzzleError = (error: Error) =>
  ({type: 'RECEIVE_PUZZLE_ERROR', error} as const);

/**
 * Action to fail receiving a puzzle.
 */
export type ReceivePuzzleError = ReturnType<typeof receivePuzzleError>;

/**
 * Persisted puzzle.
 */
export type SavedPuzzle = Readonly<{
  ts: number;
  bitmap: string;
}>;

/**
 * Load a puzzle with the given UUID.
 */
export const loadPuzzle = (uuid: string) => {
  return (dispatch: Dispatch, _getState: GetState) => {
    dispatch(REQUEST_PUZZLE);
    storageClient
      .load<SavedPuzzle>('puzzle', uuid)
      .then(({key, bitmap}) => {
        dispatch(RECEIVE_PUZZLE_SUCCESS);
        dispatch(loadBitmap(bitmap, key));
      })
      .catch((error) => {
        dispatch(loadEmptyPuzzle(uuid));
        dispatch(receivePuzzleError(error));
      });
  };
};

/**
 * Persist puzzle grid to storage without delay.
 */
const doSaveGridNow = (dispatch: Dispatch, {grid}: State) => {
  storageClient
    .save('puzzle', grid.id, crux.write(grid))
    .then(() => {
      dispatch({type: 'AUTOSAVE_GRID_SUCCESS'});
    })
    .catch((error) => {
      dispatch({type: 'AUTOSAVE_GRID_ERROR', error});
    });
};

/**
 * Initialize save action.
 */
export const AUTOSAVE_GRID_START = {
  type: 'AUTOSAVE_GRID_START',
} as const;

/**
 * Type of the initialize autosave grid start.
 */
export type AutoSaveGridStart = typeof AUTOSAVE_GRID_START;

/**
 * Create an action Thunk for saving grid using the specified function.
 */
const saveGridActionFactory = (fn: (d: Dispatch, s: State) => void) => {
  return () => {
    return (dispatch: Dispatch, getState: GetState) => {
      dispatch(AUTOSAVE_GRID_START);
      fn(dispatch, getState());
    };
  };
};

/**
 * ThunkAction: Save puzzle grid immediately.
 */
export const saveGridNow = saveGridActionFactory(doSaveGridNow);

/**
 * Report that a save is starting.
 */
export const autoSaveStart = () => AUTOSAVE_GRID_START;

/**
 * Report a successful grid save.
 */
export const autoSaveSuccess = (state: GridState) =>
  ({
    type: 'AUTOSAVE_GRID_SUCCESS',
    state,
  } as const);

/**
 * Action that signals a successful save.
 */
export type AutoSaveSuccess = ReturnType<typeof autoSaveSuccess>;

/**
 * Report a failed grid save.
 */
export const autoSaveError = (error: Error) =>
  ({
    type: 'AUTOSAVE_GRID_ERROR',
    error,
  } as const);

/**
 * Action that signals a failed save.
 */
export type AutoSaveError = ReturnType<typeof autoSaveError>;
