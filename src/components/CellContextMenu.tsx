import React from 'react';
import { pure } from 'recompose';
import { connect } from 'react-redux';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import { hideCellContext, updateCell } from '../actions';
import { CellType } from '../lib/crux';
import type {GridState} from '../reducers/grid';
import type {State, Dispatch} from '../store';
import './CellContextMenu.scss';


const getMenuPosition = (index: number, cellSize: number, width: number) => {
    const x = index % width;
    const y = ~~(index / width);
    return {
        position: 'absolute',
        left: x * cellSize + cellSize / 2,
        top: y * cellSize
    } as const;
};

type CellContextMenuViewProps = {
  grid: GridState;
  dispatch: Dispatch;
};

const CellContextMenuView = ({
        grid,
        dispatch
    }: CellContextMenuViewProps) => {
    const menuCell = grid.menuCell;

    if (menuCell === null || menuCell === undefined) {
        return null;
    }

    const width = grid.width;
    const content = grid.content;
    const cellSize = grid.cellSize;
    const cell = content[menuCell];
    const toggleToType = cell.type === CellType.Content ? CellType.Block : CellType.Content;

    return (
        <div className="CellContextMenu" style={getMenuPosition(menuCell, cellSize, width)}>
            <Paper>
                <Menu onEscKeyDown={() => dispatch(hideCellContext())}>
                    <MenuItem primaryText="Toggle Block"
                              onClick={() => dispatch(updateCell(menuCell, {
                                type: toggleToType,
                                annotation: undefined,
                                value: undefined,
                              }))} />
                </Menu>
            </Paper>
        </div>
    );
}

export const CellContextMenu = connect((state: State) => ({
    grid: state.grid
}))(pure(CellContextMenuView));
