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
import type {State, Dispatch} from '../store';
import type {GridState} from '../reducers/grid';
import type {MetaState} from '../reducers/meta';


type GridMetaMenuViewState = {
  exportGridName: string;
  newGridWidth: number;
  newGridHeight: number;
  anchorEl: React.ReactInstance | undefined;
};

type GridMetaMenuViewProps = {
  dispatch: Dispatch; 
  grid: GridState;
  meta: MetaState;
};

class GridMetaMenuView extends React.Component<GridMetaMenuViewProps, GridMetaMenuViewState> {

    constructor(props: GridMetaMenuViewProps) {
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
            newGridWidth: props.grid.width,
            newGridHeight: props.grid.height,
            anchorEl: undefined
        };
    }

    shouldComponentUpdate(nextProps: GridMetaMenuViewProps, nextState: GridMetaMenuViewState) {
        return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
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

    openGridMenu(e: React.MouseEvent) {
        const { dispatch } = this.props;
        this.setState({ anchorEl: e.currentTarget }, () => {
            dispatch(openMetaDialog('GRID_MENU'));
        });
    }

    closeDialog() {
        const { dispatch } = this.props;
        dispatch(closeMetaDialog());
    }

    importGrid(uuid: string) {
        const { dispatch } = this.props;
        dispatch(importGridShape(uuid));
        this.closeDialog();
    }

    exportGrid() {
        const { dispatch } = this.props;
        dispatch(exportGridShape(this.state.exportGridName));
        this.closeDialog();
    }

    loadPuzzle(uuid: string) {
        const { dispatch } = this.props;
        dispatch(loadPuzzle(uuid));
        this.closeDialog();
    }

    makeNewPuzzle() {
        const { dispatch } = this.props;
        dispatch(loadEmptyPuzzle());
        this.closeDialog();
    }

    updateExportName(e: React.KeyboardEvent<HTMLInputElement>) {
        this.setState({ exportGridName: (e.target as HTMLInputElement).value });
    }

    updateNewWidth(e: React.KeyboardEvent<HTMLInputElement>) {
        this.setState({ newGridWidth: +(e.target as HTMLInputElement).value });
    }

    updateNewHeight(e: React.KeyboardEvent<HTMLInputElement>) {
        this.setState({ newGridHeight: +(e.target as HTMLInputElement).value });
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
                <Popover open={meta.openDialog === 'GRID_MENU'}
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
                                  checked={grid.symmetrical}>
                            Symmetrical
                        </MenuItem>
                    </Menu>
                </Popover>
                <Dialog title="Import Grid Template"
                        open={meta.openDialog === 'IMPORT_GRID_SHAPE'}
                        contentStyle={{ width: 400 }}
                        onRequestClose={this.closeDialog}
                        autoScrollBodyContent={true}
                        actions={[<FlatButton label="Cancel" primary={false} onClick={this.closeDialog} />]}>
                    {!meta.requestingGridShapeIndex ?
                        <List>
                            {meta.gridShapeIndex.map(obj => {
                                const {key, name} = obj;
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
                        open={meta.openDialog === 'EXPORT_GRID_SHAPE'}
                        contentStyle={{ width: 400 }}
                        onRequestClose={this.closeDialog}
                        actions={[
                        <div>
                            <FlatButton label="Cancel"
                                        primary={false}
                                        onClick={this.closeDialog} />
                            <RaisedButton label="Save"
                                        primary={true}
                                        onClick={this.exportGrid} />
                        </div>
                        ]}>
                    <TextField hintText="Enter a name for this template"
                               onChange={this.updateExportName} />
                </Dialog>
                <Dialog title="Load Puzzle"
                        open={meta.openDialog === 'LOAD_PUZZLE'}
                        contentStyle={{ width: 400 }}
                        autoScrollBodyContent={true}
                        onRequestClose={this.closeDialog}
                        actions={[<FlatButton label="Cancel" primary={false} onClick={this.closeDialog} />]}>
                    {!meta.requestingPuzzleIndex ?
                        <List>
                            {meta.puzzleIndex.map(obj => {
                                const {id, title} = obj;
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
                        open={meta.openDialog === 'RESIZE_GRID'}
                        contentStyle={{ width: 400 }}
                        autoScrollBodyContent={false}
                        onRequestClose={this.closeDialog}
                        actions={[
                        <div>
                            <FlatButton label="Cancel" primary={false} onClick={this.closeDialog} />
                            <RaisedButton label="Apply" primary={true} onClick={this.resizeGrid} />
                        </div>]}>
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

export const GridMetaMenu = connect((state: State) => ({
    meta: state.meta,
    grid: state.grid
}))(GridMetaMenuView);
