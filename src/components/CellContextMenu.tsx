import React from 'react';
import Paper from '@mui/material/Paper';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {hideCellContext, updateCell} from '../actions';
import {CellType} from '../lib/crux';
import type {GridState} from '../reducers/grid';
import {useDispatch, useSelector} from '../store';
import type {State, Dispatch} from '../store';
import './CellContextMenu.scss';

const getMenuPosition = (index: number, cellSize: number, width: number) => {
  const x = index % width;
  const y = ~~(index / width);
  return {
    position: 'absolute',
    left: x * cellSize + cellSize / 2,
    top: y * cellSize,
  } as const;
};

export const CellContextMenu = () => {
  const dispatch = useDispatch();
  const grid = useSelector(({grid}) => grid);
  const menuCell = grid.menuCell;

  if (menuCell === null || menuCell === undefined) {
    return null;
  }

  const width = grid.width;
  const content = grid.content;
  const cellSize = grid.cellSize;
  const cell = content[menuCell];
  const toggleToType =
    cell.type === CellType.Content ? CellType.Block : CellType.Content;

  return (
    <div
      className="CellContextMenu"
      style={getMenuPosition(menuCell, cellSize, width)}>
      <Paper>
        <Menu open={true} onClose={() => dispatch(hideCellContext())}>
          <MenuItem
            onClick={() =>
              dispatch(
                updateCell(menuCell, {
                  type: toggleToType,
                  annotation: undefined,
                  value: undefined,
                }),
              )
            }>
            Toggle Block
          </MenuItem>
        </Menu>
      </Paper>
    </div>
  );
};
