import React, {useEffect, useRef} from 'react';
import {GridCell} from './GridCell';
import {CellContextMenu} from './CellContextMenu';
import {isDefined} from '../lib/isDefined';
import {
  updateCell,
  focusCell,
  setDirection,
  moveCursor,
  moveCursorAndUpdate,
  requestCellContext,
  hideCellContext,
} from '../actions';
import {Direction} from '../actions/gridMeta';
import type {CellUpdates} from '../actions/gridSemantic';
import type {GridState, GridCell as TGridCell} from '../reducers/grid';
import type {State, Dispatch} from '../store';
import {useSelector, useDispatch, useStore} from '../store';
import {CellType} from '../lib/crux';
import * as Keys from '../lib/keys';
import './GridContent.scss';

/**
 * Pull relevant fields out of global state.
 */
const selectProps = (state: State) => {
  const {grid} = state;

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
        return dispatch(moveCursorAndUpdate(-1, {value: ''}));
      }
    case Keys.SPACE:
      return dispatch(setDirection(getNextDirection(cursorDirection)));
    case Keys.ENTER:
    case Keys.TAB:
      // TODO implement word skip?
      return;
    case Keys.DOWN:
      return cursorDirection === Direction.Down
        ? dispatch(moveCursor(1))
        : dispatch(setDirection(Direction.Down));
    case Keys.RIGHT:
      return cursorDirection === Direction.Across
        ? dispatch(moveCursor(1))
        : dispatch(setDirection(Direction.Across));
    case Keys.UP:
      return cursorDirection === Direction.Down
        ? dispatch(moveCursor(-1))
        : dispatch(setDirection(Direction.Down));
    case Keys.LEFT:
      return cursorDirection === Direction.Across
        ? dispatch(moveCursor(-1))
        : dispatch(setDirection(Direction.Across));
    case Keys.FSLASH: {
      const curType = content[index]?.type;
      return dispatch(
        updateCell(index, {
          type: curType === 'BLOCK' ? CellType.Content : CellType.Block,
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
        return dispatch(moveCursor(1));
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
  const {
    autoFilling,
    cursor,
    cursorDirection,
    content,
    width,
    height,
    cellSize,
  } = useSelector(selectProps);

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
  const onRequestCellContext = (index: number) => {
    if (autoFilling) {
      return;
    }
    dispatch(requestCellContext(index));
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
      console.log('SETTING KEY LISTENENR');
      setKeyListener();
    } else {
      console.log('REMOVING KEY LISTENER');
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

  return (
    <div className="GridContent" ref={gridContentRoot} style={gridStyle}>
      {content.map((cell, i) => {
        const y = ~~(i / width);
        const x = i % width;
        return (
          <GridCell
            cell={cell}
            key={i}
            index={i}
            left={x}
            top={y}
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
