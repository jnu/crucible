import * as crux from '../lib/crux';
import { storageClient } from '../lib/index';
import UUID from 'pure-uuid';
import Immutable from 'immutable';
import type {AutoSaveState} from '../reducers/autosave';


/**
 * Get a list of grid templates.
 */
export const fetchGridStateIndex = () => {
    return (dispatch, getState) => {
        dispatch({ type: 'REQUEST_GRID_SHAPE_INDEX' });
        storageClient
            .index('gridShape')
            .then(index => {
                dispatch({ type: 'RECEIVE_GRID_SHAPE_INDEX', data: index });
            });
    };
};

/**
 * Save the current grid template.
 */
export const exportGridShape = (name: string) => {
    return (dispatch, getState) => {
        dispatch({ type: 'REQUEST_EXPORT_GRID_SHAPE' });
        const { grid } = getState();
        const {width, height} = grid
        // Create empty copy of content and write.
        const content = grid.content
            .map(cell => ({ type: cell.type }));
        const bitmap = crux.write({
            content,
            clues: [],
            width,
            height
        });
        const uuid = new UUID(4);
        storageClient
            .save('gridShape', uuid.format(), { name, bitmap })
            .then(() => {
                dispatch({ type: 'RECEIVE_EXPORT_GRID_SHAPE' });
            })
            .catch(error => {
                dispatch({ type: 'RECEIVE_EXPORT_GRID_SHAPE' });
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
        id
    } as const;
};

/**
 * Load a clear grid.
 */
export const loadEmptyPuzzle = () => ({
    type: 'REPLACE_GRID'
} as const);

/**
 * Action that clears and/or replaces the current grid.
 */
export type ReplaceGrid = ReturnType<typeof loadBitmap> & ReturnType<typeof loadEmptyPuzzle>;

/**
 * Load a grid template.
 */
export const importGridShape = (uuid: string) => {
    return (dispatch, getState) => {
        dispatch({ type: 'REQUEST_IMPORT_GRID_SHAPE' });
        storageClient
            .load('gridShape', uuid)
            .then(({ name, bitmap }) => {
                dispatch({ type: 'RECEIVE_IMPORT_GRID_SHAPE' });
                dispatch(loadBitmap(bitmap));
            })
            .catch(error => {
                dispatch({ type: 'RECEIVE_IMPORT_GRID_SHAPE' });
                // TODO handle this
                console.error('failed to load grid shape:', error);
            });
    };
};

/**
 * Fetch all puzzles (TODO paging)
 */
export const fetchPuzzleIndex = () => {
    return (dispatch, getState) => {
        dispatch({ type: 'REQUEST_PUZZLE_INDEX' });
        storageClient
            .index('puzzle')
            .then(index => {
                // TODO Crux should have a fast meta-data parsing function,
                // since we don't need to parse the whole puzzle here, and
                // waste time/memory.
                const data = index.map(({ bitmap, key }) => crux.read(bitmap).set('id', key));
                dispatch({ type: 'RECEIVE_PUZZLE_INDEX_SUCCESS', data });
            })
            .catch(error => dispatch({ type: 'RECEIVE_PUZZLE_INDEX_ERROR', error }));
    };
};

/**
 * Load a puzzle with the given UUID.
 */
export const loadPuzzle = (uuid: string) => {
    return (dispatch, getState) => {
        dispatch({ type: 'REQUEST_LOAD_PUZZLE' });
        storageClient
            .load('puzzle', uuid)
            .then(({ key, bitmap }) => {
                dispatch({ type: 'RECEIVE_PUZZLE_SUCCESS' });
                dispatch(loadBitmap(bitmap, key));
            })
            .catch(error => {
                dispatch({ type: 'RECEIVE_PUZZLE_ERROR', error });
            });
    };
};

/**
 * Persist puzzle grid to storage without delay.
 */
const doSaveGridNow = (dispatch, { grid }) => {
    storageClient
        .save('puzzle', grid.id.format(), crux.write(grid))
        .then(() => {
            dispatch({ type: 'AUTOSAVE_GRID_SUCCESS' });
        })
        .catch(error => {
            dispatch({ type: 'AUTOSAVE_GRID_ERROR', error });
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
const saveGridActionFactory = fn => {
    return () => {
        return (dispatch, getState) => {
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
export const autoSaveSuccess = (state: AutoSaveState) => ({
    type: 'AUTOSAVE_GRID_SUCCESS',
    state
} as const);

/**
 * Action that signals a successful save.
 */
export type AutoSaveSuccess = ReturnType<typeof autoSaveSuccess>;

/**
 * Report a failed grid save.
 */
export const autoSaveError = (error: Error) => ({
    type: 'AUTOSAVE_GRID_ERROR',
    error
} as const);

/**
 * Action that signals a failed save.
 */
export type AutoSaveError = ReturnType<typeof autoSaveError>;
