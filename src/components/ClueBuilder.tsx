import React from 'react';
import TextField from '@mui/material/TextField';
import {bindAll} from 'lodash';
import {Direction, updateClue} from '../actions';
import {isDefined} from '../lib/isDefined';
import type {State, Dispatch} from '../store';
import {useSelector, useDispatch} from '../store';

/**
 * Pull local info from the global state.
 */
const selectProps = (state: State) => {
  const {grid} = state;
  const cursor = grid.cursor;
  const cell = grid.content[cursor!];
  const field =
    grid.cursorDirection === Direction.Across ? 'acrossWord' : 'downWord';
  const index = cell ? cell[field] : -1;
  const clue = grid.clues[index!];
  const clueField =
    grid.cursorDirection === Direction.Across ? 'across' : 'down';
  const hasClue = !!clue;
  const value = hasClue ? clue[clueField] : null;

  return {
    hasClue,
    index,
    direction: grid.cursorDirection,
    value,
  };
};

/**
 * Props for the cluebuilder.
 */
export type ClueBuilderProps = {
  style?: React.CSSProperties;
};

/**
 * View for editing clues.
 */
export const ClueBuilder = ({style}: ClueBuilderProps) => {
  const dispatch = useDispatch();
  const props = useSelector(selectProps);

  // Clue update handler
  const updateClueState = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = (e.target as HTMLTextAreaElement).value;

    const {hasClue, index, direction} = props;

    if (!hasClue) {
      return;
    }

    dispatch(updateClue(direction, index!, value));
  };

  const {index, direction, value, hasClue} = props;

  const label = isDefined(index)
    ? `${index + 1} ${direction.toLowerCase()}`
    : 'Clue';

  return (
    <div className="ClueBuilder" style={style}>
      {!hasClue ? null : (
        <div>
          <TextField
            name="ClueBuiler_Input"
            variant="standard"
            placeholder="Enter clue"
            value={value}
            label={label}
            style={{width: 'calc(100% - 60px)'}}
            onChange={updateClueState}
          />
        </div>
      )}
    </div>
  );
};
