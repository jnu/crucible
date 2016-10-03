import { connect } from 'react-redux';
import { Grid } from './Grid';
import {
    resize,
    focusCell,
    updateCell,
    hideCellContext,
    requestCellContext,
    setDirection
} from '../actions';
import * as Keys from '../lib/keys';


const getPreviousCell = (direction, { row, col }) => {
    if (direction === 'ACROSS') {
        return { row: row - 1, col };
    } else if (direction === 'DOWN') {
        return { row, col: col - 1 };
    } else {
        throw new Error(`Invalid direction: ${direction}`);
    }
}

const getNextCell = (direction, { row, col }) => {
    if (direction === 'ACROSS') {
        return { row: row + 1, col };
    } else if (direction === 'DOWN') {
        return { row, col: col + 1 };
    } else {
        throw new Error(`Invalid direction: ${direction}`);
    }
}

const getNextDirection = direction => direction === 'ACROSS' ? 'DOWN' : 'ACROSS';


const mapStateToProps = state => {
    return {
        grid: state.grid
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onResize: (width, height) => dispatch(resize(width, height)),
        onFocusCell: (row, col) => {
            return dispatch(focusCell(row, col));
        },
        onUpdateCell: (row, col, updates) => dispatch(updateCell(row, col, updates)),
        onLoseCellContext: () => dispatch(hideCellContext()),
        onRequestCellContext: (row, col) => dispatch(requestCellContext(row, col)),
        onKeyDown: (e, selectedCell, selectDirection, content) => {
            if (!selectedCell) {
                return;
            }

            const row = selectedCell.get('row');
            const col = selectedCell.get('col');
            const keyCode = e.which || e.keyCode || 0;

            switch (keyCode) {
                case Keys.DELETE:
                case Keys.BACKSPACE:
                    if (content.get(row).get(col).get('value')) {
                        return dispatch(updateCell(row, col, { value: '' }));
                    } else {
                        const prev = getPreviousCell(selectDirection, { row, col })
                        return dispatch(focusCell(prev.row, prev.col));
                    }
                case Keys.SPACE:
                    return dispatch(setDirection(getNextDirection(selectDirection)));
                case Keys.ENTER:
                case Keys.TAB: {
                    const next = getNextCell(selectDirection, { row, col });
                    return dispatch(focusCell(next.row, next.col));
                }
                case Keys.DOWN:
                    return dispatch(focusCell(row + 1, col));
                case Keys.UP:
                    return dispatch(focusCell(row - 1, col));
                case Keys.LEFT:
                    return dispatch(focusCell(row, col - 1));
                case Keys.RIGHT:
                    return dispatch(focusCell(row, col + 1));
                case Keys.FSLASH: {
                    const curType = content.get(row).get(col).get('type');
                    return dispatch(updateCell(row, col, {
                        type: curType === 'BLOCK' ? 'CONTENT' : 'BLOCK'
                    }));
                }
                case 0:
                    return;
                default: {
                    const value = String.fromCharCode(keyCode);
                    if (!/[^ -~]/.test(value)) {
                        dispatch(updateCell(row, col, {
                            value: value.toUpperCase()
                        }));
                        const next = getNextCell(selectDirection, { row, col });
                        return dispatch(focusCell(next.row, next.col));
                    }
                }

            }
        }
    };
}

export const GridContainer = connect(mapStateToProps, mapDispatchToProps)(Grid);
