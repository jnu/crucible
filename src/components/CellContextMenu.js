import React from 'react';
import { pure } from 'recompose';
import { connect } from 'react-redux';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import { hideCellContext, updateCell } from '../actions';
import './CellContextMenu.scss';


const getMenuPosition = (index, cellSize, width) => {
    const x = index % width;
    const y = ~~(index / width);
    return {
        position: 'absolute',
        left: x * cellSize + cellSize / 2,
        top: y * cellSize
    };
};

const CellContextMenuView = ({
        grid,
        dispatch
    }) => {
    const menuCell = grid.get('menuCell');

    if (menuCell === null || menuCell === undefined) {
        return null;
    }

    const width = grid.get('width');
    const content = grid.get('content');
    const cellSize = grid.get('cellSize');
    const cell = content.get(menuCell);
    const toggleToType = cell.get('type') === 'CONTENT' ? 'BLOCK' : 'CONTENT';

    return (
        <div className="CellContextMenu" style={getMenuPosition(menuCell, cellSize, width)}>
            <Paper>
                <Menu onEscKeyDown={() => dispatch(hideCellContext())}>
                    <MenuItem primaryText="Toggle Block"
                              onClick={() => dispatch(updateCell(menuCell, { type: toggleToType }))} />
                </Menu>
            </Paper>
        </div>
    );
}

export const CellContextMenu = connect(state => ({
    grid: state.grid
}))(pure(CellContextMenuView));
