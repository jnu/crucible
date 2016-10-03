export const resize = (width, height) => ({
    type: 'RESIZE',
    width,
    height
});

export const focusCell = (row, col) => ({
    type: 'SELECT_CELL',
    row,
    col
});

export const requestCellContext = (row, col) => ({
    type: 'SHOW_MENU',
    row,
    col
});

export const hideCellContext = () => ({
    type: 'HIDE_MENU'
});

export const updateCell = (row, col, updates) => ({
    type: 'SET_CELL',
    row,
    col,
    cellType: updates.type,
    annotation: updates.annotation,
    value: updates.value
});

export const setDirection = direction => ({
    type: 'SET_SELECT_DIRECTION',
    direction
});

export const updateClue = (type, idx, newValue) => ({
    type: 'UPDATE_CLUE',
    direction: type,
    index: idx,
    value: newValue
});
