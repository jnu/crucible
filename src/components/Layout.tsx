import React from 'react';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import ErrorIcon from '@mui/icons-material/ReportGmailerrorred';
import LockIcon from '@mui/icons-material/Lock';
import Button from '@mui/material/Button';

import * as muiColors from '@mui/material/colors';
import {autoFillGridDismissError, autoFillGridCancel} from '../actions';
import {GridContent} from './GridContent';
import {Clues} from './Clues';
import {PuzzleStats} from './PuzzleStats';
import {ClueBuilder} from './ClueBuilder';
import {PuzzleInfo} from './PuzzleInfo';
import {WordWizard} from './WordWizard';
import {GridVerticalDivider, GridHorizontalDivider} from './GridDividers';
import {LoadingAnimation} from './LoadingAnimation';
import type {State, Dispatch} from '../store';
import type {IProgressStats} from '../lib/gridiron';
import {Direction} from '../lib/crux';
import {useSelector, useDispatch} from '../store';

import './Layout.scss';

const PUZZLE_INFO_HEIGHT = 75;
const PUZZLE_STATS_HEIGHT = 100;
const PUZZLE_STATS_WIDTH = 320;
const MIN_PUZZLE_VIEW_HEIGHT = 500;
const MIN_PUZZLE_VIEW_WIDTH = 500;
const CLUE_COL_MIN_WIDTH = 180;
const CLUE_BUILDER_HEIGHT = 65;
const WORD_WIZARD_WIDTH = 180;
const MAR_SMALL = 20;
const MAR_BIG = 40;

type StatProps = Readonly<{
  title: React.ReactNode;
  children: React.ReactNode;
}>;

/**
 * React component to display a single statistic.
 */
const Stat = ({title, children}: StatProps) => (
  <div style={{display: 'flex', margin: '5px 0'}}>
    <div style={{flexBasis: 10, flexGrow: 1}}>{title}</div>
    <div>{children}</div>
  </div>
);

/**
 * Pull local props from global state.
 */
const selectProps = (state: State) => {
  const {grid, screen} = state;
  return {
    smokeTesting: grid.smokeTesting,
    smokeTestResult: grid.smokeTestResult,
    doSmokeTest: grid.doSmokeTest,
    locked: grid.locked,
    width: grid.width,
    height: grid.height,
    cellSize: grid.cellSize,
    viewportWidth: screen.viewportWidth,
    viewportHeight: screen.viewportHeight,
    autoFilling: grid.autoFilling,
    autoFillStatus: grid.autoFillStatus,
    autoFillError: grid.autoFillError,
  };
};

/**
 * Renders an overlay to display updates about auto-fill progress.
 *
 * Note this effectively locks the editable part of the grid for click events
 * (Keyboard events should be explicitly locked by the components themselves.)
 */
const renderAutoFillOverlay = (
  {
    autoFillStatus: status,
    autoFillError: error,
  }: ReturnType<typeof selectProps>,
  dismissError: () => void,
  cancel: () => void,
) => {
  // Choose content based on init & error states.
  const hasStatus = !!status && Object.keys(status).length > 0;
  const content = error ? (
    <div>
      <p>Error: {error.message}</p>
      <Button onClick={dismissError}>OK</Button>
    </div>
  ) : hasStatus ? (
    <div>
      <Stat title="Elapsed time">{Math.round(status.elapsedTime)} seconds</Stat>
      <Stat title="Nodes considered">
        {status.visits}({Math.round(status.rate)} per second)
      </Stat>
      <Stat title="Cells left to fill">{status.leftToSolve}</Stat>
      <Stat title="Pruned search patterns">{status.pruned}</Stat>
      <Button onClick={cancel}>Cancel</Button>
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
      <div className="Layout_AutoFillOverlay-inner">{content}</div>
      {error ? null : <LoadingAnimation initializing={!hasStatus} />}
    </div>
  );
};

/**
 * Main puzzle view layout. Does a lot of response layout calculations.
 */
export const Layout = () => {
  const dispatch = useDispatch();
  const props = useSelector(selectProps);
  const {
    width,
    height,
    cellSize,
    viewportWidth,
    autoFilling,
    smokeTesting,
    doSmokeTest,
    smokeTestResult,
  } = props;

  // Layout computation. Puzzle is slightly larger than the sum of its
  // contents due to the border.
  const puzzleHeight = cellSize * height + 2;
  const puzzleWidth = cellSize * width + 2;
  const puzzleContainerHeight = Math.max(
    MIN_PUZZLE_VIEW_HEIGHT,
    puzzleHeight + CLUE_BUILDER_HEIGHT,
  );
  const puzzleContainerWidth = Math.max(
    MIN_PUZZLE_VIEW_WIDTH,
    puzzleWidth + 50,
  );
  const puzzlePadTop = Math.max(
    0,
    (puzzleContainerHeight - CLUE_BUILDER_HEIGHT - puzzleHeight) / 2,
  );
  const puzzlePadLeft = Math.max(0, (puzzleContainerWidth - puzzleWidth) / 2);
  const gridContainerStyle = {
    height: puzzleContainerHeight,
    width: puzzleContainerWidth,
    position: 'absolute',
    left: WORD_WIZARD_WIDTH + MAR_SMALL,
  } as const;
  const puzzleStyle = {
    height: puzzleHeight,
    width: puzzleWidth,
    marginLeft: puzzlePadLeft,
    paddingTop: puzzlePadTop,
  } as const;
  const clueBuilderStyle = {
    height: CLUE_BUILDER_HEIGHT,
    width: puzzleContainerWidth - 2 * MAR_SMALL,
    left: MAR_SMALL,
  } as const;
  const iconBlockStyle = {
    position: 'absolute',
    right: MAR_SMALL,
    top: CLUE_BUILDER_HEIGHT / 2,
  } as const;

  // Puzzle info styles
  const puzzleInfoStyle = {height: PUZZLE_INFO_HEIGHT} as const;

  // Reckon clue container styles
  const clueColHeight = puzzleContainerHeight / 2;
  const clueContainerStyle = {
    position: 'absolute',
    left: WORD_WIZARD_WIDTH + 2 * MAR_SMALL + puzzleContainerWidth,
    height: puzzleContainerHeight,
    width: CLUE_COL_MIN_WIDTH,
  } as const;

  const lowerHorizontTop = puzzleContainerHeight + MAR_BIG + PUZZLE_INFO_HEIGHT;
  const lowerContainerStyle = {
    position: 'absolute',
    top: lowerHorizontTop,
    height: PUZZLE_STATS_HEIGHT,
  } as const;
  const puzzleStatsStyle = {
    position: 'absolute',
    left: 0,
  } as const;
  const wordWizardStyle = {
    position: 'absolute',
  } as const;

  /**
   * Dismiss and error message.
   */
  const dismissAutoFillError = () => {
    dispatch(autoFillGridDismissError());
  };

  const cancelAutoFill = () => {
    dispatch(autoFillGridCancel());
  };

  // Show progress overlay
  const autoFillOverlay =
    autoFilling || props.autoFillError
      ? renderAutoFillOverlay(props, dismissAutoFillError, cancelAutoFill)
      : null;

  return (
    <div className="Layout">
      <PuzzleInfo style={puzzleInfoStyle} />
      <div
        className="Layout_HorizontalContainer Layout_MainBuilder"
        style={{height: puzzleContainerHeight}}>
        <div
          className="Layout_WordSuggestion-container Layout_VerticalContainer"
          style={wordWizardStyle}>
          <WordWizard
            width={WORD_WIZARD_WIDTH}
            height={puzzleContainerHeight}
          />
        </div>

        <GridVerticalDivider offset={WORD_WIZARD_WIDTH + MAR_SMALL / 2} />

        <div
          className="Layout_GridContent-container Layout_VerticalContainer"
          style={gridContainerStyle}>
          <div>
            <ClueBuilder style={clueBuilderStyle} />
          </div>
          <div style={iconBlockStyle}>
            {smokeTesting ? (
              <HourglassBottomIcon fontSize="medium" />
            ) : smokeTestResult ? (
              <CheckCircleOutlineIcon
                fontSize="medium"
                style={{fill: muiColors.green[600]}}
              />
            ) : (
              <ErrorIcon fontSize="medium" style={{fill: muiColors.red[600]}} />
            )}

            <LockIcon
              fontSize="medium"
              style={{
                fill: props.locked ? muiColors.red[600] : muiColors.grey[400],
              }}
            />
          </div>
          <div style={puzzleStyle}>
            <GridContent />
          </div>
        </div>

        <GridVerticalDivider
          offset={
            puzzleContainerWidth + WORD_WIZARD_WIDTH + MAR_SMALL + MAR_SMALL / 2
          }
        />

        <div
          className="Layout_GridClues-container Layout_VerticalContainer"
          style={clueContainerStyle}>
          <Clues
            type={Direction.Across}
            title="Across"
            topOffset={0}
            leftOffset={0}
            height={clueColHeight}
          />
          <Clues
            type={Direction.Down}
            title="Down"
            topOffset={clueColHeight}
            leftOffset={0}
            height={clueColHeight}
          />
        </div>
        {autoFillOverlay}
      </div>

      <GridHorizontalDivider
        offset={puzzleContainerHeight + PUZZLE_INFO_HEIGHT + MAR_BIG / 2}
      />

      <div
        className="Layout_HorizontalContainer Layout_Lower-container"
        style={lowerContainerStyle}>
        <div
          className="Layout_PuzzleStats-container Layout_VerticalContainer"
          style={puzzleStatsStyle}>
          <PuzzleStats />
        </div>
      </div>
    </div>
  );
};
