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
