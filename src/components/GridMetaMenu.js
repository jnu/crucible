import React from 'react';
import { pure } from 'recompose';
import { connect } from 'react-redux';
import { exportGridShape, importGridShape } from '../actions';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';


const GridMetaMenuView = pure(({ dispatch, meta }) => {
    return (
        <IconMenu iconButtonElement={<FlatButton>Grid</FlatButton>}>
            <MenuItem onClick={() => dispatch(exportGridShape())}>
                Export
            </MenuItem>
            <MenuItem onClick={() => dispatch(importGridShape())}>
                Import
            </MenuItem>
        </IconMenu>
    );
});

export const GridMetaMenu = connect(state => ({
    meta: state.meta
}))(GridMetaMenuView);
