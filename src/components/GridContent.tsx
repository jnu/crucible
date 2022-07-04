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
    moveCursorAndUpdate,
    requestCellContext,
    hideCellContext,
} from '../actions';
import { Direction } from '../actions/gridMeta';
import type { CellUpdates } from '../actions/gridSemantic';
import type { GridState } from '../reducers/grid';
import type { State, Dispatch } from '../store';
import { GridCell as TGridCell, CellType } from '../lib/crux';
import * as Keys from '../lib/keys';
import './GridContent.scss';


const getNextDirection = (direction: Direction) => direction === Direction.Across ? Direction.Down : Direction.Across;


type GridContentViewProps = Pick<GridState,
  'autoFilling'
  | 'cursor'
  | 'cursorDirection'
  | 'content'
  | 'width'
  | 'height'
  | 'cellSize'
  | 'menuCell'
  > & {dispatch: Dispatch};

class GridContentView extends React.Component<GridContentViewProps> {

    constructor(props: GridContentViewProps) {
        super(props);
        bindAll(this,
            'onFocusCell',
            'onLoseCellContext',
            'onRequestCellContext',
            'onKeyDown',
            'onDoubleClick',
        );
    }

    private mouseClickListener: ((e: MouseEvent) => void) | null | undefined;
    private keyDownListener: ((e: KeyboardEvent) => void) | null | undefined;
    private gridContentRoot: HTMLDivElement | null | undefined;

    componentDidMount() {
        const cmp = this;

        cmp.mouseClickListener = e => {
            const { gridContentRoot } = cmp;
            const { target } = e;

            if (cmp.props.autoFilling) {
                return;
            }

            if (!gridContentRoot) {
                if (DEBUG) {
                    console.warn('Did not find grid content root');
                }
                return;
            }

            // Focus event
            if (gridContentRoot.contains(target as HTMLElement)) {
                cmp.setKeyListener(cmp);
            } else {
                cmp.removeKeyListener(cmp);
            }
        };

        window.addEventListener('click', cmp.mouseClickListener);
    }

    componentWillUnmount() {
        this.removeKeyListener(this);
        if (this.mouseClickListener) {
            window.removeEventListener('click', this.mouseClickListener);
        }
    }

    removeKeyListener(cmp: GridContentView) {
        if (cmp.keyDownListener) {
            window.removeEventListener('keydown', cmp.keyDownListener);
            cmp.keyDownListener = null;
        }
    }

    setKeyListener(cmp: GridContentView) {
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
        };

        window.addEventListener('keydown', cmp.keyDownListener);
    }

    onFocusCell(index: number) {
        const { dispatch } = this.props;
        if (this.props.autoFilling) {
            return;
        }
        dispatch(focusCell(index));
    }

    onLoseCellContext() {
        const { dispatch } = this.props;
        if (this.props.autoFilling) {
            return;
        }
        dispatch(hideCellContext());
    }

    onRequestCellContext(index: number) {
        const { dispatch } = this.props;
        if (this.props.autoFilling) {
            return;
        }
        dispatch(requestCellContext(index));
    }

    onKeyDown(e: KeyboardEvent, index: number | null, cursorDirection: Direction, content: TGridCell[]) {
        const { dispatch } = this.props;

        if (this.props.autoFilling) {
            return;
        }

        if (index === undefined || index === null) {
            return;
        }

        if (e.metaKey) {
            return;
        }

        const keyCode = e.which || e.keyCode || 0;

        switch (keyCode) {
            case Keys.DELETE:
            case Keys.BACKSPACE:
                if (content[index]?.value) {
                    return dispatch(updateCell(index, { value: '' }));
                } else {
                    return dispatch(moveCursorAndUpdate(-1, { value: '' }));
                }
            case Keys.SPACE:
                return dispatch(setDirection(getNextDirection(cursorDirection)));
            case Keys.ENTER:
            case Keys.TAB:
                // TODO implement word skip?
                return;
            case Keys.DOWN:
                return (cursorDirection === Direction.Down) ?
                    dispatch(moveCursor(1)) :
                    dispatch(setDirection(Direction.Down));
            case Keys.RIGHT:
                return (cursorDirection === Direction.Across) ?
                    dispatch(moveCursor(1)) :
                    dispatch(setDirection(Direction.Across));
            case Keys.UP:
                return (cursorDirection === Direction.Down) ?
                    dispatch(moveCursor(-1)) :
                    dispatch(setDirection(Direction.Down));
            case Keys.LEFT:
                return (cursorDirection === Direction.Across) ?
                    dispatch(moveCursor(-1)) :
                    dispatch(setDirection(Direction.Across));
            case Keys.FSLASH: {
                const curType = content[index]?.type;
                return dispatch(updateCell(index, {
                    type: curType === 'BLOCK' ? CellType.Content : CellType.Block
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

    onDoubleClick() {
        const { dispatch, cursorDirection } = this.props;
        if (this.props.autoFilling) {
            return;
        }
        dispatch(setDirection(getNextDirection(cursorDirection)));
    }

    render() {
        const {
            content,
            width,
            height,
            cellSize,
            cursor,
            cursorDirection,
        } = this.props;

        const cursorCell = cursor !== null && cursor !== undefined && content[cursor];
        const highlightKey = cursorDirection === Direction.Across ? 'acrossWord' : 'downWord';
        const highlightWord = cursorCell && cursorCell[highlightKey];
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
                                  onFocus={this.onFocusCell}
                                  onDoubleClick={this.onDoubleClick}
                                  onLoseContext={this.onLoseCellContext}
                                  onRequestContext={this.onRequestCellContext}
                                  focused={cursor === i}
                                  highlight={hasHighlight && highlightWord === cell[highlightKey]}>
                        </GridCell>
                    );
                })}
                <CellContextMenu />
            </div>
        );
    }

}

const mapStateToProps = (state: State) => {
    const { grid } = state;

    return {
        content: grid.content,
        width: grid.width,
        height: grid.height,
        cellSize: grid.cellSize,
        menuCell: grid.menuCell,
        cursor: grid.cursor,
        cursorDirection: grid.cursorDirection,
        autoFilling: grid.autoFilling,
    };
};

export const GridContent = connect(mapStateToProps)(pure(GridContentView));
