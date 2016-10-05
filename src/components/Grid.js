import React from 'react';
import { shallowEqual } from 'recompose';
import { GridContent } from './GridContent';
import { Clues } from './Clues';
import './Grid.scss';


export class Grid extends React.Component {

    shouldComponentUpdate(props, nextProps) {
        return !shallowEqual(props, nextProps);
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
            const handler = cmp.props.onKeyDown;
            const grid = cmp.props.grid;
            if (!handler || !grid) {
                return;
            }
            handler(
                e,
                grid.get('selectedCell'),
                grid.get('selectedDirection'),
                grid.get('content')
            );
            e.preventDefault();
        }

        window.addEventListener('keydown', cmp.keyDownListener);
    }

    render() {
        const {
            grid,
            onResize,
            onBlur,
            onFocusCell,
            onUpdateCell,
            onLoseCellContext,
            onRequestCellContext,
            onChangeClue
        } = this.props;
        const width = grid.get('width');
        const height = grid.get('height');
        const clues = grid.get('clues');
        const content = grid.get('content');
        const cellSize = grid.get('cellSize');
        const selectedDirection = grid.get('selectedDirection');
        const selectedCell = grid.get('selectedCell');
        const menuCell = grid.get('menuCell');

        const MIN_HEIGHT = 500;
        const MIN_WIDTH = 300;
        const CLUE_COL_MIN_WIDTH = 256;
        const puzzleHeight = cellSize * height;
        const puzzleWidth = cellSize * width;
        const puzzleContainerHeight = Math.max(MIN_HEIGHT, puzzleHeight);
        const puzzleContainerWidth = Math.max(MIN_WIDTH, puzzleWidth) + 50;
        const puzzlePadTop = Math.max(0, (puzzleContainerHeight - puzzleHeight) / 2);
        const puzzlePadLeft = Math.max(0, (puzzleContainerWidth - puzzleWidth) / 2);
        const gridContainerStyle = {
            height: puzzleContainerHeight,
            width: puzzleContainerWidth
        };
        const puzzleStyle = {
            width: puzzleHeight,
            height: puzzleWidth,
            marginLeft: puzzlePadLeft,
            marginTop: puzzlePadTop
        };

        return (
            <div className="Grid">
                <div className="Grid_HorizontalContainer" style={{ height: puzzleContainerHeight }}>
                    <div className="Grid_GridContent-container Grid_VerticalContainer"
                         style={gridContainerStyle}
                         ref={target => this.gridContentRoot = target}>
                        <div style={puzzleStyle}>
                            <GridContent content={content}
                                         onFocusCell={onFocusCell}
                                         onUpdateCell={onUpdateCell}
                                         onLoseCellContext={onLoseCellContext}
                                         onRequestCellContext={onRequestCellContext}
                                         selectedCell={selectedCell}
                                         menuCell={menuCell}
                                         cellSize={cellSize} />
                        </div>
                    </div>
                    <div className="Grid_GridClues-container Grid_VerticalContainer">
                        <Clues type="across"
                               title="Across"
                               onChange={onChangeClue}
                               clues={clues}
                               content={content} />
                        <Clues type="down"
                               title="Down"
                               onChange={onChangeClue}
                               clues={clues}
                               content={content} />
                    </div>
                </div>
                <div style={{ paddingTop: 50 }} className="Grid_controls">
                    <input type="text"
                           value={width}
                           onChange={e => onResize(+e.target.value, height)} />
                    <input type="text"
                           value={height}
                           onChange={e => onResize(width, +e.target.value)} />
                </div>
            </div>
        );
    }

}
