import React from 'react';
import { shallowEqual } from 'recompose';
import { connect } from 'react-redux';
import {
    exportGridShape,
    importGridShape,
    openMetaDialog,
    closeMetaDialog,
    fetchGridStateIndex,
    fetchPuzzleIndex,
    toggleSymmetricalGrid,
    loadPuzzle,
    loadEmptyPuzzle,
    resize
} from '../actions';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import { List, ListItem } from 'material-ui/List';
import CircularProgress from 'material-ui/CircularProgress';
import TextField from 'material-ui/TextField';
import { bindAll } from 'lodash';


class GridMetaMenuView extends React.Component {

    constructor(props) {
        super(props);
        bindAll(this,
            'openImportGridShapeDialog',
            'openExportGridShapeDialog',
            'openLoadPuzzleDialog',
            'openResizeGridDialog',
            'openGridMenu',
            'closeDialog',
            'importGrid',
            'exportGrid',
            'loadPuzzle',
            'makeNewPuzzle',
            'resizeGrid',
            'updateExportName',
            'updateNewWidth',
            'updateNewHeight',
            'toggleSymmetricalGrid'
        );
        this.state = {
            exportGridName: '',
            newGridWidth: props.grid.get('width'),
            newGridHeight: props.grid.get('height'),
            anchorEl: null
        };
    }

    shouldComponentUpdate(props, nextProps) {
        return !shallowEqual(props, nextProps);
    }

    openImportGridShapeDialog() {
        const { dispatch } = this.props;
        dispatch(fetchGridStateIndex());
        dispatch(openMetaDialog('IMPORT_GRID_SHAPE'));
    }

    openExportGridShapeDialog() {
        const { dispatch } = this.props;
        dispatch(openMetaDialog('EXPORT_GRID_SHAPE'));
    }

    openLoadPuzzleDialog() {
        const { dispatch } = this.props;
        dispatch(fetchPuzzleIndex());
        dispatch(openMetaDialog('LOAD_PUZZLE'));
    }

    openResizeGridDialog() {
        const { dispatch } = this.props;
        dispatch(openMetaDialog('RESIZE_GRID'));
    }

    openGridMenu(e) {
        const { dispatch } = this.props;
        this.setState({ anchorEl: e.currentTarget }, () => {
            dispatch(openMetaDialog('GRID_MENU'));
        });
    }

    closeDialog() {
        const { dispatch } = this.props;
        dispatch(closeMetaDialog());
    }

    importGrid(uuid) {
        const { dispatch } = this.props;
        dispatch(importGridShape(uuid));
        this.closeDialog();
    }

    exportGrid() {
        const { dispatch } = this.props;
        dispatch(exportGridShape(this.state.exportGridName));
        this.closeDialog();
    }

    loadPuzzle(uuid) {
        const { dispatch } = this.props;
        dispatch(loadPuzzle(uuid));
        this.closeDialog();
    }

    makeNewPuzzle() {
        const { dispatch } = this.props;
        dispatch(loadEmptyPuzzle());
        this.closeDialog();
    }

    updateExportName(e) {
        this.setState({ exportGridName: e.target.value });
    }

    updateNewWidth(e) {
        this.setState({ newGridWidth: e.target.value });
    }

    updateNewHeight(e) {
        this.setState({ newGridHeight: e.target.value });
    }

    resizeGrid() {
        const { dispatch } = this.props;
        const { newGridWidth, newGridHeight } = this.state;
        dispatch(resize(+newGridWidth, +newGridHeight));
        this.closeDialog();
    }

    toggleSymmetricalGrid() {
        const { dispatch } = this.props;
        dispatch(toggleSymmetricalGrid());
        this.closeDialog();
    }

    render() {
        const { meta, grid } = this.props;

        return (
            <div className="GridMetaMenu">
                <FlatButton onClick={this.openGridMenu}>Grid</FlatButton>
                <Popover open={meta.get('openDialog') === 'GRID_MENU'}
                         anchorEl={this.state.anchorEl}
                         anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                         targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                         onRequestClose={this.closeDialog}>
                    <Menu>
                        <MenuItem onClick={this.makeNewPuzzle}>
                            New Puzzle
                        </MenuItem>
                        <MenuItem onClick={this.openLoadPuzzleDialog}>
                            Load Puzzle
                        </MenuItem>
                        <MenuItem onClick={this.openExportGridShapeDialog}>
                            Save Grid Template
                        </MenuItem>
                        <MenuItem onClick={this.openImportGridShapeDialog}>
                            Load Grid Template
                        </MenuItem>
                        <MenuItem onClick={this.openResizeGridDialog}>
                            Resize ...
                        </MenuItem>
                        <MenuItem onClick={this.toggleSymmetricalGrid}
                                  checked={grid.get('symmetrical')}>
                            Symmetrical
                        </MenuItem>
                    </Menu>
                </Popover>
                <Dialog title="Import Grid Template"
                        open={meta.get('openDialog') === 'IMPORT_GRID_SHAPE'}
                        contentStyle={{ width: 400 }}
                        onRequestClose={this.closeDialog}
                        autoScrollBodyContent={true}
                        actions={<FlatButton label="Cancel" primary={false} onClick={this.closeDialog} />}>
                    {!meta.get('requestingGridShapeIndex') ?
                        <List>
                            {meta.get('gridShapeIndex').map(obj => {
                                const key = obj.get('key');
                                const name = obj.get('name');
                                return (
                                    <ListItem key={key} onClick={() => this.importGrid(key)}>
                                        {name ? name : <span>Unnamed</span>}
                                    </ListItem>
                                );
                            })}
                        </List> :
                        <CircularProgress />
                    }
                </Dialog>
                <Dialog title="Save Grid Template"
                        open={meta.get('openDialog') === 'EXPORT_GRID_SHAPE'}
                        contentStyle={{ width: 400 }}
                        onRequestClose={this.closeDialog}
                        actions={
                        <div>
                            <FlatButton label="Cancel"
                                        primary={false}
                                        onClick={this.closeDialog} />
                            <RaisedButton label="Save"
                                        primary={true}
                                        onClick={this.exportGrid} />
                        </div>
                        }>
                    <TextField hintText="Enter a name for this template"
                               onChange={this.updateExportName} />
                </Dialog>
                <Dialog title="Load Puzzle"
                        open={meta.get('openDialog') === 'LOAD_PUZZLE'}
                        contentStyle={{ width: 400 }}
                        autoScrollBodyContent={true}
                        onRequestClose={this.closeDialog}
                        actions={<FlatButton label="Cancel" primary={false} onClick={this.closeDialog} />}>
                    {!meta.get('requestingPuzzleIndex') ?
                        <List>
                            {meta.get('puzzleIndex').map(obj => {
                                const id = obj.get('id');
                                const title = obj.get('title');
                                return (
                                    <ListItem key={id} onClick={() => this.loadPuzzle(id)}>
                                        {title ? title : <span>(Untitled)</span>}
                                    </ListItem>
                                );
                            })}
                        </List> :
                        <CircularProgress />
                    }
                </Dialog>
                <Dialog title="Resize Grid"
                        open={meta.get('openDialog') === 'RESIZE_GRID'}
                        contentStyle={{ width: 400 }}
                        autoScrollBodyContent={false}
                        onRequestClose={this.closeDialog}
                        actions={
                        <div>
                            <FlatButton label="Cancel" primary={false} onClick={this.closeDialog} />
                            <RaisedButton label="Apply" primary={true} onClick={this.resizeGrid} />
                        </div>}>
                        <div>
                            Width: <TextField name="ResizeGrid_Width_Input"
                                              value={this.state.newGridWidth}
                                              hintText="Enter puzzle width"
                                              onChange={this.updateNewWidth} />
                        </div>
                        <div>
                            Height: <TextField name="ResizeGrid_Height_Input"
                                               value={this.state.newGridHeight}
                                               hintText="Enter puzzle height"
                                               onChange={this.updateNewHeight} />
                        </div>
                </Dialog>
            </div>
        );
    }
}

export const GridMetaMenu = connect(state => ({
    meta: state.meta,
    grid: state.grid
}))(GridMetaMenuView);
