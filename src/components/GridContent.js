import React from 'react';
import { connect } from 'react-redux';
import { pure } from 'recompose';
import { bindAll } from 'lodash';
import { GridCell } from './GridCell';
import { CellContextMenu } from './CellContextMenu';
import {
    updateCell,
    focusCell,
    setDirection,
    moveCursor,
    requestCellContext,
    hideCellContext
} from '../actions';
import * as Keys from '../lib/keys';
import './GridContent.scss';


const getNextDirection = direction => direction === 'ACROSS' ? 'DOWN' : 'ACROSS';

const isSelectedCell = (selectedCell, row, col) => {
    if (!selectedCell) {
        return false;
    }
    return selectedCell.get('row') === row && selectedCell.get('col') === col;
};


class GridContentView extends React.Component {

    constructor(props) {
        super(props);
        bindAll(this,
            'onFocusCell',
            'onUpdateCell',
            'onLoseCellContext',
            'onRequestCellContext',
            'onKeyDown'
        );
    }

    componentDidMount() {
        const cmp = this;

        cmp.mouseClickListener = e => {
            const { gridContentRoot } = cmp;
            const { target } = e;

            if (!gridContentRoot) {
                if (DEBUG) {
                    console.warn('Did not find grid content root');
                }
                return;
            }

            // Focus event
            if (gridContentRoot.contains(target)) {
                cmp.setKeyListener(cmp);
            } else {
                cmp.removeKeyListener(cmp);
            }
        }

        window.addEventListener('click', cmp.mouseClickListener);
    }

    componentWillUnmount() {
        this.removeKeyListener(this);
        if (this.mouseClickListener) {
            window.removeEventListener('click', this.mouseClickListener);
        }
    }

    removeKeyListener(cmp) {
        if (cmp.keyDownListener) {
            window.removeEventListener('keydown', cmp.keyDownListener);
            cmp.keyDownListener = null;
        }
    }

    setKeyListener(cmp) {
        if (cmp.keyDownListener) {
            return;
        }

        cmp.keyDownListener = e => {
            const handler = cmp.onKeyDown;
            const { cursor, cursorDirection, content } = cmp.props;
            if (!handler) {
                return;
            }
            handler(
                e,
                cursor,
                cursorDirection,
                content
            );
            e.preventDefault();
        }

        window.addEventListener('keydown', cmp.keyDownListener);
    }

    onFocusCell(index) {
        const { dispatch } = this.props;
        dispatch(focusCell(index));
    }

    onUpdateCell(index, updates) {
        const { dispatch } = this.props;
        dispatch(updateCell(index, updates));
    }

    onLoseCellContext() {
        const { dispatch } = this.props;
        dispatch(hideCellContext());
    }

    onRequestCellContext(index) {
        const { dispatch } = this.props;
        dispatch(requestCellContext(index));
    }

    onKeyDown(e, index, cursorDirection, content) {
        const { dispatch } = this.props;

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

    render() {
        const {
            content,
            width,
            height,
            cellSize,
            menuCell,
            cursor,
            cursorDirection
        } = this.props;

        const cursorCell = cursor !== null && cursor !== undefined && content.get(cursor);
        const highlightKey = cursorDirection === 'ACROSS' ? 'acrossWord' : 'downWord';
        const highlightWord = cursorCell && cursorCell.get(highlightKey);
        const hasHighlight = !!cursorCell && highlightWord !== null && highlightWord !== undefined;
        // Grid is 1px larger than the sum of its cells due to border
        const gridStyle = {
            width: width * cellSize + 2,
            height: height * cellSize + 2
        };

        return (
            <div className="GridContent"
                 ref={target => this.gridContentRoot = target}
                 style={gridStyle}>
                {content.map((cell, i) => {
                    const y = ~~(i / width);
                    const x = i % width;
                    return (
                        <GridCell cell={cell}
                                  key={i}
                                  index={i}
                                  left={x}
                                  top={y}
                                  size={cellSize}
                                  onChange={this.onUpdateCell}
                                  onFocus={this.onFocusCell}
                                  onDoubleClick={this.onDoubleClick}
                                  onLoseContext={this.onLoseCellContext}
                                  onRequestContext={this.onRequestCellContext}
                                  focused={cursor === i}
                                  highlight={hasHighlight && highlightWord === cell.get(highlightKey)}>
                        </GridCell>
                    );
                })}
                <CellContextMenu />
            </div>
        );
    }

}

const mapStateToProps = state => {
    const { grid } = state;

    return {
        content: grid.get('content'),
        width: grid.get('width'),
        height: grid.get('height'),
        cellSize: grid.get('cellSize'),
        menuCell: grid.get('menuCell'),
        cursor: grid.get('cursor'),
        cursorDirection: grid.get('cursorDirection')
    };
};

export const GridContent = connect(mapStateToProps)(pure(GridContentView));
