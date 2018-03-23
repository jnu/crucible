import { moveCursor } from './gridMeta';
import {fill} from "../lib/gridiron";


export const resize = (width, height) => ({
    type: 'RESIZE',
    width,
    height
});

export const updateCell = (index, updates) => ({
    type: 'SET_CELL',
    index,
    cellType: updates.type,
    annotation: updates.annotation,
    value: updates.value
});

/**
 * [Async] fill in grid automatically, with regard to initial constraints.
 */
export const autoFillGrid = (wordList) => {
    return (dispatch, getState) => {
        dispatch({type: 'AUTO_FILL_GRID_START'});
        const gridContent = getState().grid.get('content').toJS();
        fill(gridContent,
             wordList.get('lists').toJS(),
                stats => dispatch({type: 'AUTO_FILL_STATS_UPDATE', stats}))
            .then(filled => {
                dispatch({type: 'AUTO_FILL_GRID_DONE', content: filled});
            })
            .catch(error => {
                dispatch({type: 'AUTO_FILL_GRID_ERROR', error});
            });
    };
};

/**
 * Dismiss an error that occurred while auto-filling grid.
 */
export const autoFillGridDismissError = () => ({
    type: 'AUTO_FILL_GRID_DISMISS_ERROR',
});

export const updateClue = (type, index, newValue) => ({
    type: 'UPDATE_CLUE',
    direction: type,
    index,
    value: newValue
});

export const moveCursorAndUpdate = (delta, updates) => {
    return (dispatch, getState) => {
        dispatch(moveCursor(delta));
        const { grid } = getState();
        dispatch(updateCell(grid.get('cursor'), updates));
    };
};

export const updatePuzzleInfo = (key, value) => ({
    type: 'UPDATE_PUZZLE_INFO',
    key,
    value
});
