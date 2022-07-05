import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {
  exportGridShape,
  importGridShape,
  openMetaDialog,
  closeMetaDialog,
  fetchGridStateIndex,
  fetchPuzzleIndex,
  toggleGridLock as aToggleGridLock,
  toggleSymmetricalGrid as aToggleSymmetricalGrid,
  toggleHeatMap as aToggleHeatMap,
  loadEmptyPuzzle,
  resize,
  autoFillGrid,
} from '../actions';
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

/**
 * Tool menus and associated dialogs.
 */
export const GridMetaMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {grid, meta, wordlist} = useSelector((x) => x);
  const [exportGridName, setExportGridName] = useState('');
  const [newGridWidth, setNewGridWidth] = useState(grid.width);
  const [newGridHeight, setNewGridHeight] = useState(grid.height);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

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
    dispatch(openMetaDialog('GRID_MENU'));
  };

  const openMagicMenu = (e: React.MouseEvent) => {
    setAnchorEl(e.currentTarget as HTMLElement);
    dispatch(openMetaDialog('MAGIC_MENU'));
  };

  const closeDialog = () => {
    setAnchorEl(null);
    dispatch(closeMetaDialog());
  };

  const importGrid = (uuid: string) => {
    dispatch(importGridShape(uuid, navigate));
    closeDialog();
  };

  const exportGrid = () => {
    dispatch(exportGridShape(exportGridName));
    closeDialog();
  };

  const loadPuzzle = (uuid: string) => {
    navigate(`/${uuid}`);
    closeDialog();
  };

  const makeNewPuzzle = () => {
    dispatch(loadEmptyPuzzle());
    closeDialog();
  };

  const autoFill = () => {
    dispatch(autoFillGrid(wordlist));
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

  const toggleGridLock = () => {
    dispatch(aToggleGridLock());
    closeDialog();
  };

  const toggleSymmetricalGrid = () => {
    dispatch(aToggleSymmetricalGrid());
    closeDialog();
  };

  const toggleHeatMap = () => {
    dispatch(aToggleHeatMap());
    closeDialog();
  };

  const gridMenuOpen = meta.openDialog === 'GRID_MENU' && !!anchorEl;
  const magicMenuOpen = meta.openDialog === 'MAGIC_MENU' && !!anchorEl;

  // Render the menu
  return (
    <div className="GridMetaMenu">
      {/* GRID MENU */}
      <Button
        id="grid-menu-button"
        aria-controls={gridMenuOpen ? 'grid-menu' : undefined}
        aria-haspopup={true}
        aria-expanded={gridMenuOpen ? true : undefined}
        onClick={openGridMenu}>
        Grid
      </Button>

      <Menu
        MenuListProps={{'aria-labelledby': 'grid-menu-button'}}
        anchorEl={anchorEl}
        onClose={closeDialog}
        id="grid-menu"
        open={gridMenuOpen}>
        <MenuItem onClick={makeNewPuzzle}>New Puzzle</MenuItem>
        <MenuItem onClick={openLoadPuzzleDialog}>Load Puzzle</MenuItem>
        <MenuItem onClick={openExportGridShapeDialog}>
          Save Grid Template
        </MenuItem>
        <MenuItem onClick={openImportGridShapeDialog}>
          Load Grid Template
        </MenuItem>
        <MenuItem onClick={openResizeGridDialog}>Resize ...</MenuItem>
        <MenuItem onClick={toggleGridLock}>
          {grid.locked ? (
            <ListItemIcon>
              <Check />
            </ListItemIcon>
          ) : null}
          Lock Grid
        </MenuItem>
        <MenuItem onClick={toggleSymmetricalGrid}>
          {grid.symmetrical ? (
            <ListItemIcon>
              <Check />
            </ListItemIcon>
          ) : null}
          Symmetrical
        </MenuItem>
      </Menu>

      {/* MAGIC MENU */}
      <Button
        id="magic-menu-button"
        aria-controls={magicMenuOpen ? 'magic-menu' : undefined}
        aria-haspopup={true}
        aria-expanded={magicMenuOpen ? true : undefined}
        onClick={openMagicMenu}>
        Magic
      </Button>

      <Menu
        MenuListProps={{'aria-labelledby': 'magic-menu-button'}}
        anchorEl={anchorEl}
        onClose={closeDialog}
        id="magic-menu"
        open={magicMenuOpen}>
        <MenuItem onClick={toggleHeatMap}>
          {grid.showHeatMap ? (
            <ListItemIcon>
              <Check />
            </ListItemIcon>
          ) : null}
          Show heat map
        </MenuItem>
        <MenuItem onClick={autoFill}>Autofill</MenuItem>
      </Menu>

      {/* DIALOGS */}
      <Dialog
        title="Import Grid Template"
        open={meta.openDialog === 'IMPORT_GRID_SHAPE'}
        onClose={closeDialog}
        scroll="paper">
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
        onClose={closeDialog}>
        <DialogContent>
          <TextField
            variant="standard"
            label="Template name"
            onChange={updateExportName}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} variant="text">
            Cancel
          </Button>
          <Button variant="text" onClick={exportGrid}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        title="Load Puzzle"
        open={meta.openDialog === 'LOAD_PUZZLE'}
        scroll="paper"
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
        onClose={closeDialog}>
        <DialogContent>
          <div>
            <TextField
              name="ResizeGrid_Width_Input"
              value={newGridWidth}
              variant="standard"
              label="Puzzle width"
              onChange={updateNewWidth}
            />
          </div>
          <div>
            <TextField
              name="ResizeGrid_Height_Input"
              value={newGridHeight}
              variant="standard"
              label="Puzzle height"
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
