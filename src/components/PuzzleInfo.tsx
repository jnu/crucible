import React from 'react';
import TextField from '@mui/material/TextField';
import {updatePuzzleInfo} from '../actions';
import {useSelector, useDispatch} from '../store';
import type {State, Dispatch} from '../store';

import './PuzzleInfo.scss';

export type PuzzleInfoProps = {
  style?: React.CSSProperties;
};

export const PuzzleInfo = ({style}: PuzzleInfoProps) => {
  const dispatch = useDispatch();
  const value = useSelector(({grid}) => grid.title);

  const updatePuzzleTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = (e.target as HTMLTextAreaElement).value;
    dispatch(updatePuzzleInfo('title', value));
  };

  return (
    <div className="PuzzleInfo" style={style}>
      <div className="PuzzleInfo_Title">
        <TextField
          name="PuzzleInfo_Title_Input"
          value={value}
          helperText="Puzzle title"
          onChange={updatePuzzleTitle}
        />
      </div>
    </div>
  );
};
