export {
  toggleSymmetricalGrid,
  toggleGridLock,
  toggleHeatMap,
  setDirection,
  focusCell,
  moveCursor,
  requestCellContext,
  hideCellContext,
} from './gridMeta';

export {
  viewPdf,
  viewEditor,
} from './view';

export {
  resize,
  updateCell,
  updateClue,
  moveCursorAndUpdate,
  updatePuzzleInfo,
  autoFillGrid,
  autoFillGridDismissError,
  autoFillGridCancel,
  runSmokeTest,
} from './gridSemantic';

export {setScreenSize, openMetaDialog, closeMetaDialog} from './meta';

export {
  fetchGridStateIndex,
  fetchPuzzleIndex,
  exportGridShape,
  loadBitmap,
  importGridShape,
  saveGridNow,
  loadPuzzle,
  autoSaveStart,
  autoSaveSuccess,
  autoSaveError,
  loadEmptyPuzzle,
} from './storage';

export {loadWordList, addWord, addCustomWord, removeWord, removeCustomWord} from './wordlist';

// TYPES

import type {
  ViewPdf,
  ViewEditor,
} from './view';
import type {
  ReplaceGrid,
  AutoSaveGridStart,
  AutoSaveSuccess,
  AutoSaveError,
  RequestExportGridShape,
  ReceiveExportGridShape,
  RequestGridShapeIndex,
  ReceiveGridShapeIndex,
  RequestImportGridShape,
  ReceiveImportGridShape,
  RequestPuzzleIndex,
  ReceivePuzzleIndexSuccess,
  ReceivePuzzleIndexError,
  RequestPuzzle,
  ReceivePuzzleSuccess,
  ReceivePuzzleError,
} from '../actions/storage';
import type {
  Resize,
  SetCell,
  UpdateClue,
  UpdatePuzzleInfo,
  AutoFillGridDismissError,
  AutoFillGridStart,
  AutoFillGridDone,
  AutoFillGridStatsUpdate,
  AutoFillGridError,
  RequestSmokeTest,
  ReceiveSmokeTestResult,
} from '../actions/gridSemantic';
import type {
  ToggleSymmetricalGrid,
  SelectCell,
  SetCursorDirection,
  HideMenu,
  ShowMenu,
  MoveCursor,
  ToggleGridLock,
  ToggleHeatMap,
} from '../actions/gridMeta';
import type {
  OpenMetaDialog,
  CloseMetaDialog,
  ScreenResize,
} from '../actions/meta';
import type {
  RequestWordlist,
  ReceiveWordlistSuccess,
  ReceiveWordlistError,
  RemoveWord,
  AddWord,
} from '../actions/wordlist';

/**
 * Discriminated union representing all possible actions.
 */
export type Action =
  | ViewPdf
  | ViewEditor
  | ReplaceGrid
  | AutoSaveGridStart
  | AutoSaveSuccess
  | AutoSaveError
  | Resize
  | SetCell
  | SelectCell
  | SetCursorDirection
  | HideMenu
  | ShowMenu
  | UpdateClue
  | MoveCursor
  | ReplaceGrid
  | ToggleSymmetricalGrid
  | ToggleGridLock
  | ToggleHeatMap
  | UpdatePuzzleInfo
  | AutoFillGridDismissError
  | AutoFillGridDone
  | AutoFillGridStatsUpdate
  | AutoFillGridError
  | AutoFillGridStart
  | OpenMetaDialog
  | CloseMetaDialog
  | RequestExportGridShape
  | ReceiveExportGridShape
  | RequestImportGridShape
  | ReceiveImportGridShape
  | RequestGridShapeIndex
  | ReceiveGridShapeIndex
  | RequestPuzzleIndex
  | ReceivePuzzleIndexSuccess
  | ReceivePuzzleIndexError
  | RequestPuzzle
  | ReceivePuzzleSuccess
  | ReceivePuzzleError
  | ScreenResize
  | RequestWordlist
  | ReceiveWordlistSuccess
  | ReceiveWordlistError
  | RemoveWord
  | AddWord
  | RequestSmokeTest
  | ReceiveSmokeTestResult;
