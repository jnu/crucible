import React, {useState, useEffect} from 'react';
import {
  exportGridShape,
  importGridShape,
  openMetaDialog,
  closeMetaDialog,
  fetchGridStateIndex,
  fetchPuzzleIndex,
  toggleSymmetricalGrid as aToggleSymmetricalGrid,
  loadPuzzle as aLoadPuzzle,
  loadEmptyPuzzle,
  resize,
} from '../actions';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Check from '@mui/icons-material/Check';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import {bindAll} from 'lodash';
import type {State, Dispatch} from '../store';
import {useSelector, useDispatch} from '../store';
import type {GridState} from '../reducers/grid';
import type {MetaState} from '../reducers/meta';

export const GridMetaMenu = () => {
  const dispatch = useDispatch();
  const {grid, meta} = useSelector((x) => x);
  const [exportGridName, setExportGridName] = useState('');
  const [newGridWidth, setNewGridWidth] = useState(grid.width);
  const [newGridHeight, setNewGridHeight] = useState(grid.height);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!anchorEl) {
      return;
    }
    dispatch(openMetaDialog('GRID_MENU'));
  }, [anchorEl]);

  const openImportGridShapeDialog = () => {
    dispatch(fetchGridStateIndex());
    dispatch(openMetaDialog('IMPORT_GRID_SHAPE'));
  };

  const openExportGridShapeDialog = () => {
    dispatch(openMetaDialog('EXPORT_GRID_SHAPE'));
  };

  const openLoadPuzzleDialog = () => {
    dispatch(fetchPuzzleIndex());
    dispatch(openMetaDialog('LOAD_PUZZLE'));
  };

  const openResizeGridDialog = () => {
    dispatch(openMetaDialog('RESIZE_GRID'));
  };

  const openGridMenu = (e: React.MouseEvent) => {
    setAnchorEl(e.currentTarget as HTMLElement);
    // NOTE: setting the anchorEl triggers the useEffect hook defined above,
    // where the menu is actually opened. This avoids a race between setting
    // the anchor el and opening the dialog.
  };

  const closeDialog = () => {
    dispatch(closeMetaDialog());
  };

  const importGrid = (uuid: string) => {
    dispatch(importGridShape(uuid));
    closeDialog();
  };

  const exportGrid = () => {
    dispatch(exportGridShape(exportGridName));
    closeDialog();
  };

  const loadPuzzle = (uuid: string) => {
    dispatch(aLoadPuzzle(uuid));
    closeDialog();
  };

  const makeNewPuzzle = () => {
    dispatch(loadEmptyPuzzle());
    closeDialog();
  };

  const updateExportName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExportGridName((e.target as HTMLInputElement).value);
  };

  const updateNewWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGridWidth(+(e.target as HTMLInputElement).value);
  };

  const updateNewHeight = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGridHeight(+(e.target as HTMLInputElement).value);
  };

  const resizeGrid = () => {
    dispatch(resize(+newGridWidth, +newGridHeight));
    closeDialog();
  };

  const toggleSymmetricalGrid = () => {
    dispatch(aToggleSymmetricalGrid());
    closeDialog();
  };

  // Render the menu
  return (
    <div className="GridMetaMenu">
      <Button variant="text" onClick={openGridMenu}>
        Grid
      </Button>
      <Popover
        open={meta.openDialog === 'GRID_MENU'}
        anchorEl={anchorEl}
        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
        onClose={closeDialog}>
        <Menu open={meta.openDialog === 'GRID_MENU'}>
          <MenuItem onClick={makeNewPuzzle}>New Puzzle</MenuItem>
          <MenuItem onClick={openLoadPuzzleDialog}>Load Puzzle</MenuItem>
          <MenuItem onClick={openExportGridShapeDialog}>
            Save Grid Template
          </MenuItem>
          <MenuItem onClick={openImportGridShapeDialog}>
            Load Grid Template
          </MenuItem>
          <MenuItem onClick={openResizeGridDialog}>Resize ...</MenuItem>
          <MenuItem onClick={toggleSymmetricalGrid}>
            {grid.symmetrical ? (
              <ListItemIcon>
                <Check />
              </ListItemIcon>
            ) : null}
            Symmetrical
          </MenuItem>
        </Menu>
      </Popover>
      <Dialog
        title="Import Grid Template"
        open={meta.openDialog === 'IMPORT_GRID_SHAPE'}
        maxWidth="sm"
        onClose={closeDialog}
        scroll="body">
        <DialogContent>
          {!meta.requestingGridShapeIndex ? (
            <List>
              {meta.gridShapeIndex.map((obj) => {
                const {key, name} = obj;
                return (
                  <ListItem key={key} onClick={() => importGrid(key)}>
                    {name ? name : <span>Unnamed</span>}
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={closeDialog}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        title="Save Grid Template"
        open={meta.openDialog === 'EXPORT_GRID_SHAPE'}
        maxWidth="sm"
        onClose={closeDialog}>
        <DialogContent>
          <TextField
            helperText="Enter a name for this template"
            onChange={updateExportName}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="text" onClick={exportGrid}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        title="Load Puzzle"
        open={meta.openDialog === 'LOAD_PUZZLE'}
        maxWidth="sm"
        scroll="body"
        onClose={closeDialog}>
        <DialogContent>
          {!meta.requestingPuzzleIndex ? (
            <List>
              {meta.puzzleIndex.map((obj) => {
                const {id, title} = obj;
                return (
                  <ListItem key={id} onClick={() => loadPuzzle(id)}>
                    {title ? title : <span>(Untitled)</span>}
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        title="Resize Grid"
        open={meta.openDialog === 'RESIZE_GRID'}
        maxWidth="sm"
        onClose={closeDialog}>
        <DialogContent>
          <div>
            Width:{' '}
            <TextField
              name="ResizeGrid_Width_Input"
              value={newGridWidth}
              helperText="Enter puzzle width"
              onChange={updateNewWidth}
            />
          </div>
          <div>
            Height:{' '}
            <TextField
              name="ResizeGrid_Height_Input"
              value={newGridHeight}
              helperText="Enter puzzle height"
              onChange={updateNewHeight}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={closeDialog}>
            Cancel
          </Button>
          <Button onClick={resizeGrid}>Apply</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
