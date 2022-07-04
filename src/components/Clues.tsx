import React from 'react';
import {Direction, focusCell, setDirection} from '../actions';
import type {GridCell, GridClue} from '../reducers/grid';
import type {State, Dispatch} from '../store';
import {useDispatch, useSelector} from '../store';
import './Clues.scss';

/**
 * Height in pixels for the clue header.
 */
const CLUE_HEADER_HEIGHT = 42;

/**
 * Get the CSS class name for the clues list.
 */
const getClueClassName = (
  i: number,
  selection: number | void | null,
  isPrimary: boolean,
) => {
  const cn = ['Clues_Clue'];
  if (i === selection) {
    cn.push('Clues_Clue-selected');

    if (isPrimary) {
      cn.push('Clues_Clue-selected-primary');
    }
  }
  return cn.join(' ');
};

/**
 * Props for the clues list view.
 */
export type CluesProps = {
  type: Direction;
  height: number;
  title: string;
  leftOffset: number;
  topOffset: number;
};

/**
 * Pluck info relevant to the clues from the global store.
 */
const selectProps = (state: State) => {
  const {grid} = state;
  return {
    clues: grid.clues,
    content: grid.content,
    cursor: grid.cursor,
    cursorDirection: grid.cursorDirection,
  };
};

/**
 * View for the clues list.
 */
export const Clues = (props: CluesProps) => {
  const dispatch = useDispatch();
  const {height, title, type, leftOffset, topOffset} = props;

  const {cursorDirection, content, cursor, clues} = useSelector(selectProps);

  const onClickClue = (clue: GridClue, type: Direction) => {
    const field =
      type.toLowerCase() === 'across' ? 'acrossStartIdx' : 'downStartIdx';
    const cell = clue[field];
    if (cell !== null) {
      dispatch(focusCell(cell));
    }
    dispatch(setDirection(type));
  };

  if (!content || !clues) {
    return null;
  }

  const isPrimarySelection =
    cursorDirection.toLowerCase() === type.toLowerCase();
  const cell = cursor !== null ? content[cursor] : null;
  const selectionField = type === Direction.Across ? 'acrossWord' : 'downWord';
  const selection = cell && cell[selectionField];
  const clueField = type === Direction.Across ? 'across' : 'down';

  return (
    <div
      className={`Clues Clues-${type.toLowerCase()}`}
      style={{
        height,
        top: topOffset,
        left: leftOffset,
        position: 'absolute',
      }}>
      <div
        className="Clues_header-container"
        style={{height: CLUE_HEADER_HEIGHT}}>
        <span className="Clues_header">{title}</span>
        <div className="Clues_spacer" />
      </div>
      <ol className="Clues_list" style={{height: height - CLUE_HEADER_HEIGHT}}>
        {clues.map((clue, i) =>
          clue[clueField] === null ? null : (
            <li
              key={`${type}-${i}`}
              className={getClueClassName(i, selection, isPrimarySelection)}
              onClick={() => onClickClue(clue, type)}>
              <span className="Clues_Clue_idx">{i + 1}</span>
              <span className="Clues_Clue_text">{clue[clueField]}</span>
            </li>
          ),
        )}
      </ol>
    </div>
  );
};
