import React, {useEffect, useRef, useState} from 'react';
import {GridCell} from './GridCell';
import {CellContextMenu} from './CellContextMenu';
import {isDefined} from '../lib/isDefined';
import {
  toggleGridLock,
  updateCell,
  focusCell,
  setDirection,
  moveCursor,
  moveCursorAndUpdate,
  requestCellContext,
  hideCellContext,
} from '../actions';
import {CellType, Direction} from '../lib/crux';
import {analyzeGrid} from '../lib/gridiron';
import type {GridAnalysis} from '../lib/gridiron';
import type {CellUpdates} from '../actions/gridSemantic';
import type {GridState, GridCell as TGridCell} from '../reducers/grid';
import type {State, Dispatch} from '../store';
import {useSelector, useDispatch, useStore} from '../store';
import * as Keys from '../lib/keys';
import './GridContent.scss';

/**
 * Pull relevant fields out of global state.
 */
const selectProps = (state: State) => {
  const {grid, wordlist} = state;

  return {
    showHeatMap: grid.showHeatMap,
    wordlist: wordlist.lists,
    content: grid.content,
    width: grid.width,
    height: grid.height,
    cellSize: grid.cellSize,
    menuCell: grid.menuCell,
    cursor: grid.cursor,
    cursorDirection: grid.cursorDirection,
    autoFilling: grid.autoFilling,
    autoFillStatus: grid.autoFillStatus,
  };
};

/**
 * Fancy way to compute offset, accounting for locked grid.
 */
const getOffset = (n: 1 | -1, grid: GridState) => {
  if (!grid.locked) {
    return n;
  }
  // Skip blocks when grid is locked

  const x = grid.cursorDirection === Direction.Across ? n : n * grid.width;
  let i = n;
  let p = (grid.cursor || 0) + x;
  while (true) {
    const c = grid.content[p];
    // Break if we went out of bounds
    if (!c) {
      break;
    }

    // Break if the next cell is a content cell
    if (c.type === CellType.Content) {
      break;
    }

    // Keep searching if the next cell is a block
    i += n;
    p += x;
  }

  return i;
};

// Key handler
const onKeyDown = (keyCode: number, grid: GridState, dispatch: Dispatch) => {
  const {content, cursorDirection, cursor: index} = grid;
  if (!isDefined(index)) {
    return;
  }

  switch (keyCode) {
    case Keys.DELETE:
    case Keys.BACKSPACE:
      if (content[index]?.value) {
        return dispatch(updateCell(index, {value: ''}));
      } else {
        return dispatch(moveCursorAndUpdate(getOffset(-1, grid), {value: ''}));
      }
    case Keys.SPACE:
      return dispatch(setDirection(getNextDirection(cursorDirection)));
    case Keys.ENTER:
    case Keys.TAB:
      // TODO implement word skip?
      return;
    case Keys.DOWN:
      return cursorDirection === Direction.Down
        ? dispatch(moveCursor(getOffset(1, grid)))
        : dispatch(setDirection(Direction.Down));
    case Keys.RIGHT:
      return cursorDirection === Direction.Across
        ? dispatch(moveCursor(getOffset(1, grid)))
        : dispatch(setDirection(Direction.Across));
    case Keys.UP:
      return cursorDirection === Direction.Down
        ? dispatch(moveCursor(getOffset(-1, grid)))
        : dispatch(setDirection(Direction.Down));
    case Keys.LEFT:
      return cursorDirection === Direction.Across
        ? dispatch(moveCursor(getOffset(-1, grid)))
        : dispatch(setDirection(Direction.Across));
    case Keys.BSLASH:
      return dispatch(toggleGridLock());
    case Keys.FSLASH: {
      if (grid.locked) {
        return;
      }
      const curType = content[index]?.type;
      return dispatch(
        updateCell(index, {
          type: curType === CellType.Block ? CellType.Content : CellType.Block,
        }),
      );
    }
    case 0:
      return;
    default: {
      const value = String.fromCharCode(keyCode);
      if (!/[^ -~]/.test(value)) {
        dispatch(
          updateCell(index, {
            value: value.toUpperCase(),
          }),
        );

        return dispatch(moveCursor(getOffset(1, grid)));
      }
    }
  }
};

/**
 * Toggle the cursor direction.
 */
const getNextDirection = (direction: Direction) =>
  direction === Direction.Across ? Direction.Down : Direction.Across;

/**
 * Container for all the puzzle squares.
 */
export const GridContent = () => {
  const store = useStore();
  const gridContentRoot = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const [analysis, setAnalysis] = useState<GridAnalysis | null>(null);
  const {
    autoFilling,
    autoFillStatus,
    cursor,
    cursorDirection,
    content,
    width,
    height,
    cellSize,
    wordlist,
    showHeatMap,
  } = useSelector(selectProps);

  // Analyze the grid when it changes to show heat viz.
  useEffect(() => {
    if (!showHeatMap) {
      setAnalysis(null);
      return;
    }
    analyzeGrid(content, wordlist).then((r) => setAnalysis(r));
  }, [content, wordlist, showHeatMap]);

  // Handle clicking into a cell
  const onFocusCell = (index: number) => {
    if (autoFilling) {
      return;
    }
    dispatch(focusCell(index));
  };

  // Handle clicking out of a cell
  const onLoseCellContext = () => {
    if (autoFilling) {
      return;
    }
    dispatch(hideCellContext());
  };

  // Handle left click on a cell
  const onRequestCellContext = (index: number, x: number, y: number) => {
    if (autoFilling) {
      return;
    }
    dispatch(requestCellContext(index, x, y));
  };

  // Mouse click listener
  const mouseClickListener = (e: MouseEvent) => {
    const {target} = e;

    if (autoFilling) {
      return;
    }

    if (!gridContentRoot.current) {
      if (DEBUG) {
        console.warn('Did not find grid content root');
      }
      return;
    }

    // Focus event
    if (gridContentRoot.current.contains(target as HTMLElement)) {
      setKeyListener();
    } else {
      removeKeyListener();
    }
  };

  // Keyboard event handler.
  const keyListener = (e: KeyboardEvent) => {
    if (e.metaKey) {
      return;
    }
    const keyCode = e.which || e.keyCode || 0;
    const {grid} = store.getState();
    if (grid.autoFilling) {
      return;
    }

    onKeyDown(keyCode, grid, store.dispatch);

    e.preventDefault();
  };

  // Remove a global delegated keydown listener.
  const removeKeyListener = () => {
    window.removeEventListener('keydown', keyListener);
  };

  // Add a global delegated keydown listener.
  const setKeyListener = () => {
    removeKeyListener();
    window.addEventListener('keydown', keyListener);
  };

  // Handle double clicks on the grid.
  const onDoubleClick = () => {
    if (autoFilling) {
      return;
    }
    dispatch(setDirection(getNextDirection(cursorDirection)));
  };

  // Set up event handlers when the grid is rendered.
  useEffect(() => {
    window.addEventListener('click', mouseClickListener);

    return () => {
      removeKeyListener();
      window.removeEventListener('click', mouseClickListener);
    };
  }, []);

  // Render the grid.
  const cursorCell = cursor !== null && cursor !== undefined && content[cursor];
  const highlightKey =
    cursorDirection === Direction.Across ? 'acrossWord' : 'downWord';
  const highlightWord = cursorCell && cursorCell[highlightKey];
  const hasHighlight =
    !!cursorCell && highlightWord !== null && highlightWord !== undefined;
  // Grid is 1px larger than the sum of its cells due to border
  const gridStyle = {
    width: width * cellSize + 2,
    height: height * cellSize + 2,
  };

  // If the autofill process is running, show the intermediate results in the
  // background for a cool effect. Otherwise use the normal grid.
  const relevantContent = (autoFilling && autoFillStatus?.grid) || content;
  const relevantAnalysis = autoFilling ? autoFillStatus?.analysis : analysis;

  return (
    <div className="GridContent" ref={gridContentRoot} style={gridStyle}>
      {relevantContent.map((cell, i) => {
        const y = ~~(i / width);
        const x = i % width;
        return (
          <GridCell
            cell={cell}
            key={i}
            index={i}
            left={x}
            top={y}
            heat={
              relevantAnalysis && showHeatMap
                ? relevantAnalysis[i]?.heat
                : undefined
            }
            size={cellSize}
            onFocus={onFocusCell}
            onDoubleClick={onDoubleClick}
            onLoseContext={onLoseCellContext}
            onRequestContext={onRequestCellContext}
            focused={cursor === i}
            highlight={hasHighlight && highlightWord === cell[highlightKey]}
          />
        );
      })}
      <CellContextMenu />
    </div>
  );
};
