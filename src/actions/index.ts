export {
    toggleSymmetricalGrid,
    setDirection,
    focusCell,
    moveCursor,
    requestCellContext,
    hideCellContext,
} from './gridMeta';

export {
    resize,
    updateCell,
    updateClue,
    moveCursorAndUpdate,
    updatePuzzleInfo,
    autoFillGrid,
    autoFillGridDismissError,
} from './gridSemantic';

export {
    setScreenSize,
    openMetaDialog,
    closeMetaDialog,
} from './meta';

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

export {
    loadWordList
} from './wordlist';


// TYPES

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
} from '../actions/gridSemantic';
import type {
    ToggleSymmetricalGrid,
    SelectCell,
    SetCursorDirection,
    HideMenu,
    ShowMenu,
    MoveCursor,
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
} from '../actions/wordlist';

/**
 * Discriminated union representing all possible actions.
 */
export type Action =
  ReplaceGrid
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
  ;

