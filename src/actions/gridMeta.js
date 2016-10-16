export const toggleSymmetricalGrid = () => ({
    type: 'TOGGLE_SYMMETRICAL_GRID'
});

export const setDirection = direction => ({
    type: 'SET_CURSOR_DIRECTION',
    direction
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
