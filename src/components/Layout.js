import React from 'react';
import { connect } from 'react-redux';
import { shallowEqual } from 'recompose';
import { GridContent } from './GridContent';
import { Clues } from './Clues';
import { PuzzleStats } from './PuzzleStats';
import { ClueBuilder } from './ClueBuilder';
import { GridVerticalDivider, GridHorizontalDivider } from './GridDividers';
import './Layout.scss';


const PUZZLE_STATS_HEIGHT = 100;
const MIN_PUZZLE_VIEW_HEIGHT = 500;
const MIN_PUZZLE_VIEW_WIDTH = 500;
const CLUE_COL_MIN_WIDTH = 180;
const CLUE_BUILDER_HEIGHT = 50;
const MAR_BIG = 40;


class LayoutView extends React.Component {

    shouldComponentUpdate(props, nextProps) {
        return !shallowEqual(props, nextProps);
    }

    render() {
        const {
            width,
            height,
            cellSize,
            onResize,
            viewportWidth
        } = this.props;

        // Layout computation
        const puzzleHeight = cellSize * height;
        const puzzleWidth = cellSize * width;
        const puzzleContainerHeight = Math.max(MIN_PUZZLE_VIEW_HEIGHT, puzzleHeight + CLUE_BUILDER_HEIGHT);
        const puzzleContainerWidth = Math.max(MIN_PUZZLE_VIEW_WIDTH, puzzleWidth + 50)
        const puzzlePadTop = Math.max(0, (puzzleContainerHeight - CLUE_BUILDER_HEIGHT - puzzleHeight) / 2);
        const puzzlePadLeft = Math.max(0, (puzzleContainerWidth - puzzleWidth) / 2);
        const gridContainerStyle = {
            height: puzzleContainerHeight,
            width: puzzleContainerWidth
        };
        const puzzleStyle = {
            height: puzzleHeight,
            width: puzzleWidth,
            marginLeft: puzzlePadLeft,
            marginTop: puzzlePadTop
        };
        const clueBuilderStyle = {
            height: CLUE_BUILDER_HEIGHT
        };

        // Reckon clue container styles
        const collapseClueCols = viewportWidth < (puzzleContainerWidth + 2 * CLUE_COL_MIN_WIDTH);
        const clueColHeight = collapseClueCols ? puzzleContainerHeight / 2 : puzzleContainerHeight;
        const clueContainerStyle = {
            height: puzzleContainerHeight,
            width: collapseClueCols ? CLUE_COL_MIN_WIDTH : 2 * CLUE_COL_MIN_WIDTH
        };

        const puzzleStatsStyle = {
            position: 'absolute',
            top: puzzleContainerHeight + MAR_BIG,
            height: PUZZLE_STATS_HEIGHT
        };

        return (
            <div className="Layout">
                <div className="Layout_HorizontalContainer Layout_MainBuilder"
                     style={{ height: puzzleContainerHeight }}>
                    <div className="Layout_GridContent-container Layout_VerticalContainer"
                         style={gridContainerStyle}>
                        <div>
                            <ClueBuilder style={clueBuilderStyle} />
                        </div>
                        <div style={puzzleStyle}>
                            <GridContent />
                        </div>
                    </div>
                    <GridVerticalDivider offset={puzzleContainerWidth} />
                    <div className="Layout_GridClues-container Layout_VerticalContainer"
                         style={clueContainerStyle}>
                        <Clues type="across"
                               title="Across"
                               topOffset={0}
                               leftOffset={0}
                               height={clueColHeight}
                        />
                        <Clues type="down"
                               title="Down"
                               topOffset={collapseClueCols ? clueColHeight : 0}
                               leftOffset={collapseClueCols ? 0 : CLUE_COL_MIN_WIDTH}
                               height={clueColHeight}
                        />
                    </div>
                </div>
                <GridHorizontalDivider offset={puzzleContainerHeight + MAR_BIG / 2} />
                <div className="Layout_HorizontalContainer Layout_PuzzleStats-container"
                     style={puzzleStatsStyle}>
                    <PuzzleStats />
                </div>
            </div>
        );
    }

}

const mapStateToProps = state => {
    const { grid, screen } = state;
    return {
        width: grid.get('width'),
        height: grid.get('height'),
        cellSize: grid.get('cellSize'),
        viewportWidth: screen.get('viewportWidth'),
        viewportHeight: screen.get('viewportHeight')
    };
};


export const Layout = connect(mapStateToProps)(LayoutView);
