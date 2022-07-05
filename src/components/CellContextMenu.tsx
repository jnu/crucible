import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {isDefined} from '../lib/isDefined';
import {hideCellContext, updateCell} from '../actions';
import {CellType} from '../lib/crux';
import {useDispatch, useSelector} from '../store';
import type {State, Dispatch} from '../store';
import type {GridState} from '../reducers/grid';
import './CellContextMenu.scss';

/**
 * Context menu that provides options for a cell in the grid.
 */
export const CellContextMenu = () => {
  const dispatch = useDispatch();
  const {locked, menuCell, menuX, menuY, content, cellSize, width} =
    useSelector(({grid}) => grid);

  const cell = content[menuCell!];
  const toggleToType =
    cell?.type === CellType.Content ? CellType.Block : CellType.Content;

  return (
    <Menu
      anchorReference="anchorPosition"
      anchorPosition={
        isDefined(menuX) && isDefined(menuY)
          ? {top: menuY, left: menuX}
          : undefined
      }
      open={isDefined(menuCell)}
      onClose={() => dispatch(hideCellContext())}>
      <MenuItem
        disabled={locked}
        onClick={() =>
          !locked &&
          dispatch(
            updateCell(menuCell!, {
              type: toggleToType,
              annotation: undefined,
              value: undefined,
            }),
          )
        }>
        Toggle Block
      </MenuItem>
    </Menu>
  );
};
