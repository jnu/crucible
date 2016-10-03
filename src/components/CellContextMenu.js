import React from 'react';
import { pure } from 'recompose';
import { connect } from 'react-redux';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import { hideCellContext, updateCell } from '../actions';
import './CellContextMenu.scss';


const getMenuPosition = (row, col, cellSize) => {
    return {
        position: 'absolute',
        left: col * cellSize + cellSize / 2,
        top: row * cellSize
    };
};

const CellContextMenuView = ({
        target,
        content,
        cellSize,
        dispatch
    }) => {
    if (!target) {
        return null;
    }

    const row = target.get('row');
    const col = target.get('col');
    const cell = content.get(row).get(col);
    const toggleToType = cell.get('type') === 'CONTENT' ? 'BLOCK' : 'CONTENT';

    return (
        <div className="CellContextMenu" style={getMenuPosition(row, col, cellSize)}>
            <Paper>
                <Menu onEscKeyDown={() => dispatch(hideCellContext())}>
                    <MenuItem primaryText="Toggle Block"
                              onClick={() => dispatch(updateCell(row, col, { type: toggleToType }))} />
                </Menu>
            </Paper>
        </div>
    );
}

export const CellContextMenu = connect()(pure(CellContextMenuView));
