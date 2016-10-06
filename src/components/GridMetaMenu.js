import React from 'react';
import { pure } from 'recompose';
import { connect } from 'react-redux';
import {
    exportGridShape,
    importGridShape,
    openMetaDialog,
    closeMetaDialog,
    fetchGridStateIndex
} from '../actions';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import { List, ListItem } from 'material-ui/List';


const GridMetaMenuView = pure(({ dispatch, meta }) => {
    const openGridShapeDialog = () => {
        dispatch(fetchGridStateIndex());
        dispatch(openMetaDialog('IMPORT_GRID_SHAPE'));
    };
    const closeDialog = () => dispatch(closeMetaDialog());
    const importGrid = uuid => {
        dispatch(importGridShape(uuid));
        closeDialog();
    };
    const actions = (
        <div>
            <FlatButton label="Cancel" primary={false} onTouchTap={closeDialog} />
            <FlatButton label="Load" primary={true} onTouchTap={importGrid} />
        </div>
    );
    return (
        <div>
            <IconMenu iconButtonElement={<FlatButton>Grid</FlatButton>}>
                <MenuItem onClick={() => dispatch(exportGridShape())}>
                    Export
                </MenuItem>
                <MenuItem onClick={openGridShapeDialog}>
                    Import
                </MenuItem>
            </IconMenu>
            <Dialog title="Import Grid Template"
                    open={meta.get('openDialog') === 'IMPORT_GRID_SHAPE'}
                    onRequestClose={closeDialog}
                    autoScrollBodyContent={true}>
                {!meta.get('requestingGridShapeIndex') ?
                    <List>
                        {meta.get('gridShapeIndex').map(uuid => {
                            return <ListItem key={uuid} onTouchTap={() => importGrid(uuid)}>{uuid}</ListItem>;
                        })}
                    </List> :
                    'Loading ...'
                }
            </Dialog>
        </div>
    );
});

export const GridMetaMenu = connect(state => ({
    meta: state.meta
}))(GridMetaMenuView);
