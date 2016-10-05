import { connect } from 'react-redux';
import { Grid } from './Grid';
import {
    resize,
    focusCell,
    updateCell,
    moveCursor,
    hideCellContext,
    requestCellContext,
    setDirection,
    updateClue
} from '../actions';
import * as Keys from '../lib/keys';


const getNextDirection = direction => direction === 'ACROSS' ? 'DOWN' : 'ACROSS';

const mapStateToProps = state => {
    return {
        grid: state.grid
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onResize: (width, height) => dispatch(resize(width, height)),
        onFocusCell: (index) => {
            return dispatch(focusCell(index));
        },
        onUpdateCell: (index, updates) => dispatch(updateCell(index, updates)),
        onLoseCellContext: () => dispatch(hideCellContext()),
        onRequestCellContext: index => dispatch(requestCellContext(index)),
        onChangeClue: (type, idx, newValue) => dispatch(updateClue(type, idx, newValue)),
        onKeyDown: (e, index, cursorDirection, content) => {
            if (index === undefined || index === null) {
                return;
            }

            const keyCode = e.which || e.keyCode || 0;

            switch (keyCode) {
                case Keys.DELETE:
                case Keys.BACKSPACE:
                    if (content.get(index).get('value')) {
                        return dispatch(updateCell(index, { value: '' }));
                    } else {
                        return dispatch(moveCursor(-1));
                    }
                case Keys.SPACE:
                    return dispatch(setDirection(getNextDirection(cursorDirection)));
                case Keys.ENTER:
                case Keys.TAB:
                    // TODO implement word skip?
                    return;
                case Keys.DOWN:
                    return (cursorDirection === 'DOWN') ?
                        dispatch(moveCursor(1)) :
                        dispatch(setDirection('DOWN'));
                case Keys.RIGHT:
                    return (cursorDirection === 'ACROSS') ?
                        dispatch(moveCursor(1)) :
                        dispatch(setDirection('ACROSS'));
                case Keys.UP:
                    return (cursorDirection === 'DOWN') ?
                        dispatch(moveCursor(-1)) :
                        dispatch(setDirection('DOWN'));
                case Keys.LEFT:
                    return (cursorDirection === 'ACROSS') ?
                        dispatch(moveCursor(-1)) :
                        dispatch(setDirection('ACROSS'));
                case Keys.FSLASH: {
                    const curType = content.get(index).get('type');
                    return dispatch(updateCell(index, {
                        type: curType === 'BLOCK' ? 'CONTENT' : 'BLOCK'
                    }));
                }
                case 0:
                    return;
                default: {
                    const value = String.fromCharCode(keyCode);
                    if (!/[^ -~]/.test(value)) {
                        dispatch(updateCell(index, {
                            value: value.toUpperCase()
                        }));
                        return dispatch(moveCursor(1));
                    }
                }

            }
        }
    };
}

export const GridContainer = connect(mapStateToProps, mapDispatchToProps)(Grid);
