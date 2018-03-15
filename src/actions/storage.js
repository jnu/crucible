import * as crux from '../lib/crux';
import { storageClient } from '../lib/index';
import UUID from 'pure-uuid';
import Immutable from 'immutable';



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

export const exportGridShape = name => {
    return (dispatch, getState) => {
        dispatch({ type: 'REQUEST_EXPORT_GRID_SHAPE' });
        const { grid } = getState();
        const width = grid.get('width');
        const height = grid.get('height');
        // Create empty copy of content and write.
        const content = grid.get('content')
            .map(cell => Immutable.Map({ type: cell.get('type') }));
        const clues = Immutable.List();
        const bitmap = crux.write(Immutable.Map({
            content,
            clues,
            width,
            height
        }));
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

export const loadBitmap = (bitmap, id=null) => {
    const grid = crux.read(bitmap);
    return {
        type: 'REPLACE_GRID',
        grid,
        id
    };
};

export const loadEmptyPuzzle = () => ({
    type: 'REPLACE_GRID'
});

export const importGridShape = uuid => {
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

export const loadPuzzle = uuid => {
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
    const id = grid.get('id');

    storageClient
        .save('puzzle', id.format(), crux.write(grid))
        .then(() => {
            dispatch({ type: 'AUTOSAVE_GRID_SUCCESS' });
        })
        .catch(error => {
            dispatch({ type: 'AUTOSAVE_GRID_ERROR', error });
        });
};

/**
 * Create an action Thunk for saving grid using the specified function.
 */
const saveGridActionFactory = fn => {
    return () => {
        return (dispatch, getState) => {
            dispatch({ type: 'AUTOSAVE_GRID_START' });
            fn(dispatch, getState());
        };
    };
};

/**
 * ThunkAction: Save puzzle grid immediately.
 */
export const saveGridNow = saveGridActionFactory(doSaveGridNow);

export const autoSaveStart = () => ({
    type: 'AUTOSAVE_GRID_START'
});

export const autoSaveSuccess = state => ({
    type: 'AUTOSAVE_GRID_SUCCESS',
    state
});

export const autoSaveError = error => ({
    type: 'AUTOSAVE_GRID_ERROR',
    error
});
