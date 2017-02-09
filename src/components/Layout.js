import React from 'react';
import { connect } from 'react-redux';
import { shallowEqual } from 'recompose';
import { GridContent } from './GridContent';
import { Clues } from './Clues';
import { PuzzleStats } from './PuzzleStats';
import { ClueBuilder } from './ClueBuilder';
import { PuzzleInfo } from './PuzzleInfo';
import { WordWizard } from './WordWizard';
import { GridVerticalDivider, GridHorizontalDivider } from './GridDividers';
import './Layout.scss';


const PUZZLE_INFO_HEIGHT = 50;
const PUZZLE_STATS_HEIGHT = 100;
const PUZZLE_STATS_WIDTH = 320;
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
            viewportWidth
        } = this.props;

        // Layout computation. Puzzle is slightly larger than the sum of its
        // contents due to the border.
        const puzzleHeight = cellSize * height + 2;
        const puzzleWidth = cellSize * width + 2;
        const puzzleContainerHeight = Math.max(MIN_PUZZLE_VIEW_HEIGHT, puzzleHeight + CLUE_BUILDER_HEIGHT);
        const puzzleContainerWidth = Math.max(MIN_PUZZLE_VIEW_WIDTH, puzzleWidth + 50);
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

        const lowerHorizontTop = puzzleContainerHeight + MAR_BIG + PUZZLE_INFO_HEIGHT;
        const lowerContainerStyle = {
            position: 'absolute',
            top: lowerHorizontTop,
            height: PUZZLE_STATS_HEIGHT
        };
        const puzzleStatsStyle = {
            position: 'absolute',
            left: 0
        };
        const wordWizardStyle = {
            position: 'absolute',
            left: 2 * MAR_BIG + PUZZLE_STATS_WIDTH
        };

        return (
            <div className="Layout">
                <PuzzleInfo />
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
                <GridHorizontalDivider offset={puzzleContainerHeight + PUZZLE_INFO_HEIGHT + MAR_BIG / 2} />
                <div className="Layout_HorizontalContainer Layout_Lower-container"
                     style={lowerContainerStyle}>
                    <div className="Layout_PuzzleStats-container Layout_VerticalContainer"
                         style={puzzleStatsStyle}>
                        <PuzzleStats />
                    </div>
                    <GridVerticalDivider offset={PUZZLE_STATS_WIDTH + MAR_BIG} />
                    <div className="Layout_WordSuggestion-container Layout_VerticalContainer"
                         style={wordWizardStyle}>
                        <WordWizard />
                    </div>
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
