import React from 'react';
import { shallowEqual } from 'recompose';
import { GridContent } from './GridContent';
import { Clues } from './Clues';
import { PuzzleStats } from './PuzzleStats';
import { ClueBuilder } from './ClueBuilder';
import './Grid.scss';


const CLUE_HEADER_HEIGHT = 30;


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
                grid.get('cursor'),
                grid.get('cursorDirection'),
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
            onChangeClue,
            viewportWidth,
            viewportHeight
        } = this.props;
        const width = grid.get('width');
        const height = grid.get('height');
        const clues = grid.get('clues');
        const content = grid.get('content');
        const cellSize = grid.get('cellSize');
        const cursorDirection = grid.get('cursorDirection');
        const cursor = grid.get('cursor');
        const menuCell = grid.get('menuCell');
        const hasCursor = cursor !== null && cursor !== undefined;
        const cursorCell = hasCursor && content.get(cursor);
        const selectedDownWord = cursorCell && cursorCell.get('downWord');
        const selectedAcrossWord = cursorCell && cursorCell.get('acrossWord');

        const MIN_HEIGHT = 500;
        const MIN_WIDTH = 300;
        const CLUE_COL_MIN_WIDTH = 180;
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

        // Reckon clue container styles
        const collapseClueCols = viewportWidth < (puzzleContainerWidth + 2 * CLUE_COL_MIN_WIDTH);
        const clueColHeight = collapseClueCols ? puzzleContainerHeight / 2 : puzzleContainerHeight;
        const clueContainerStyle = {
            height: puzzleContainerHeight,
            width: collapseClueCols ? CLUE_COL_MIN_WIDTH : 2 * CLUE_COL_MIN_WIDTH
        };

        return (
            <div className="Grid">
                <div className="Grid_HorizontalContainer Grid_MainBuilder" style={{ height: puzzleContainerHeight }}>
                    <div className="Grid_GridContent-container Grid_VerticalContainer"
                         style={gridContainerStyle}>
                        <div>
                            <ClueBuilder />
                        </div>
                        <div style={puzzleStyle}
                             ref={target => this.gridContentRoot = target}>
                            <GridContent content={content}
                                         width={width}
                                         height={height}
                                         onFocusCell={onFocusCell}
                                         onUpdateCell={onUpdateCell}
                                         onLoseCellContext={onLoseCellContext}
                                         onRequestCellContext={onRequestCellContext}
                                         cursor={cursor}
                                         cursorDirection={cursorDirection}
                                         menuCell={menuCell}
                                         cellSize={cellSize} />
                        </div>
                    </div>
                    <div className="Grid_GridClues-container Grid_VerticalContainer"
                         style={clueContainerStyle}>
                        <Clues type="across"
                                   title="Across"
                                   selection={selectedAcrossWord}
                                   isPrimarySelection={cursorDirection === 'ACROSS'}
                                   topOffset={0}
                                   leftOffset={0}
                                   height={clueColHeight}
                                   onChange={onChangeClue}
                                   clues={clues}
                                   content={content} />
                        <Clues type="down"
                               title="Down"
                               topOffset={collapseClueCols ? clueColHeight : 0}
                               leftOffset={collapseClueCols ? 0 : CLUE_COL_MIN_WIDTH}
                               selection={selectedDownWord}
                               isPrimarySelection={cursorDirection === 'DOWN'}
                               height={clueColHeight}
                               onChange={onChangeClue}
                               clues={clues}
                               content={content} />
                    </div>
                </div>
                <div className="Grid_HorizontalContainer Grid_PuzzleStats-container">
                    <PuzzleStats />
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
