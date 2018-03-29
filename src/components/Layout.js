import React from 'react';
import {connect} from 'react-redux';
import {shallowEqual} from 'recompose';
import {autoFillGridDismissError} from '../actions';
import {GridContent} from './GridContent';
import {Clues} from './Clues';
import {PuzzleStats} from './PuzzleStats';
import {ClueBuilder} from './ClueBuilder';
import {PuzzleInfo} from './PuzzleInfo';
import {WordWizard} from './WordWizard';
import {GridVerticalDivider, GridHorizontalDivider} from './GridDividers';
import {LoadingAnimation} from './LoadingAnimation';
import './Layout.scss';


const PUZZLE_INFO_HEIGHT = 75;
const PUZZLE_STATS_HEIGHT = 100;
const PUZZLE_STATS_WIDTH = 320;
const MIN_PUZZLE_VIEW_HEIGHT = 500;
const MIN_PUZZLE_VIEW_WIDTH = 500;
const CLUE_COL_MIN_WIDTH = 180;
const CLUE_BUILDER_HEIGHT = 50;
const MAR_SMALL = 20;
const MAR_BIG = 40;


/**
 * React component to display a single statistic.
 */
const Stat = ({title, children}) => (
    <div style={{display: 'flex', margin: '5px 0'}}>
        <div style={{flexBasis: 10, flexGrow: 1}}>{title}</div>
        <div>{children}</div>
    </div>
);


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
            height: CLUE_BUILDER_HEIGHT,
            width: puzzleContainerWidth - 2 * MAR_SMALL,
            left: MAR_SMALL,
            position: 'relative'
        };

        // Puzzle info styles
        const puzzleInfoStyle = { height: PUZZLE_INFO_HEIGHT };

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

        const autoFillOverlay = this.props.autoFilling && this.renderAutoFillOverlay();

        return (
            <div className="Layout">
                <PuzzleInfo style={puzzleInfoStyle} />
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
                    {autoFillOverlay}
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

    /**
     * Renders an overlay to display updates about auto-fill progress.
     *
     * Note this effectively locks the editable part of the grid for click events
     * (Keyboard events should be explicitly locked by the components themselves.)
     */
     renderAutoFillOverlay() {
        const status = this.props.autoFillStatus;
        const error = this.props.autoFillError;

        // Choose content based on init & error states.
        const hasStatus = !!status && Object.keys(status).length > 0;
        const content = error ? (
                <div>
                    <p>Error: {error.message}</p>
                    <button onClick={this.dismissAutoFillError}>OK</button>
                </div>
            ) : hasStatus ? (
                <div>
                    <Stat title="Elapsed time">{Math.round(status.elapsedTime)} seconds</Stat>
                    <Stat title="Patterns tested">{status.n} ({Math.round(status.rate)} per second)</Stat>
                    <Stat title="Nodes considered">{status.visits}
                        ({Math.round(status.n / status.visits)} patterns per node)</Stat>
                    <Stat title="Words solved">{status.totalWords - status.leftToSolve}</Stat>
                    <Stat title="Total words to solve">{status.totalWords}</Stat>
                    <Stat title="Pruned search patterns">{status.pruned}</Stat>
                    <Stat title="Dead ends">{status.backtracks}</Stat>
                </div>
            ) : (
                <div>
                    {/* TODO(jnu) animation here instead of text */}
                    Initializing auto-fill ...
                </div>
            );
        return (
            <div className="Layout_AutoFillOverlay">
                <h2 style={{textAlign: 'center'}}>Auto fill</h2>
                <div className="Layout_AutoFillOverlay-inner">
                    {content}
                </div>
                <LoadingAnimation initializing={!hasStatus} />
            </div>
        );
     }

     dismissAutoFillError() {
         this.props.dispatch(autoFillGridDismissError());
     }

}

const mapStateToProps = state => {
    const { grid, screen } = state;
    return {
        width: grid.get('width'),
        height: grid.get('height'),
        cellSize: grid.get('cellSize'),
        viewportWidth: screen.get('viewportWidth'),
        viewportHeight: screen.get('viewportHeight'),
        autoFilling: grid.get('autoFilling'),
        autoFillStatus: grid.get('autoFillStatus'),
        autoFillError: grid.get('autoFillError'),
    };
};


export const Layout = connect(mapStateToProps)(LayoutView);
