import { moveCursor } from './gridMeta';


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
