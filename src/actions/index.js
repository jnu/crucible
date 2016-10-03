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
