import {
    gridShapeToBitmap,
    bitmapToGridShape
} from '../lib/gridShape';
import { storageClient } from '../lib';
import UUID from 'pure-uuid';
import Immutable from 'immutable';


export const resize = (width, height) => ({
    type: 'RESIZE',
    width,
    height
});

export const focusCell = index => ({
    type: 'SELECT_CELL',
    index
});

export const moveCursor = delta => ({
    type: 'MOVE_CURSOR',
    delta
});

export const requestCellContext = index => ({
    type: 'SHOW_MENU',
    index
});

export const hideCellContext = () => ({
    type: 'HIDE_MENU'
});

export const updateCell = (index, updates) => ({
    type: 'SET_CELL',
    index,
    cellType: updates.type,
    annotation: updates.annotation,
    value: updates.value
});

export const setDirection = direction => ({
    type: 'SET_CURSOR_DIRECTION',
    direction
});

export const updateClue = (type, index, newValue) => ({
    type: 'UPDATE_CLUE',
    direction: type,
    index,
    value: newValue
});

export const setScreenSize = (width, height) => ({
    type: 'SCREEN_RESIZE',
    width,
    height
});

export const openMetaDialog = key => ({
    type: 'OPEN_META_DIALOG',
    key
});

export const closeMetaDialog = () => ({
    type: 'CLOSE_META_DIALOG'
});

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
        const content = grid.get('content');
        const bitmap = gridShapeToBitmap(content, { width, height });
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

export const loadBitmap = bitmap => {
    const { content, width, height } = bitmapToGridShape(bitmap);
    return {
        type: 'SET_GRID_SHAPE',
        content: Immutable.List(content.map(type => Immutable.Map({ type }))),
        width,
        height
    };
};

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
            })
    };
};
