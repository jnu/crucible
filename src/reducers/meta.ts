import {Action} from '../actions';
import type {SavedGridTemplate} from '../actions/storage';
import type {CruxPuzzle} from '../lib/crux';

/**
 * Empty state of the meta store.
 */
const DEFAULT_META_STATE = {
    openDialog: null,
    requestingExport: false,
    requestingImport: false,
    requestingGridShapeIndex: false,
    gridShapeIndex: [],
    requestingPuzzle: false,
    puzzleRequestError: null,
    requestingPuzzleIndex: false,
    puzzleIndexRequestError: null,
    puzzleIndex: [],
} as const;

/**
 * Type of the meta store.
 */
export type MetaState = Readonly<{
  openDialog: string | null;
  requestingExport: boolean;
  requestingImport: boolean;
  requestingGridShapeIndex: boolean;
  gridShapeIndex: ReadonlyArray<SavedGridTemplate>;
  requestingPuzzle: boolean;
  puzzleRequestError: Error | null;
  requestingPuzzleIndex: boolean;
  puzzleIndexRequestError: Error | null;
  puzzleIndex: ReadonlyArray<CruxPuzzle>;
}>;

/**
 * Reducer to apply state changes to the meta store.
 */
export const meta = (state = DEFAULT_META_STATE, action: Action): MetaState => {
    switch (action.type) {
        case 'OPEN_META_DIALOG':
            return {...state, openDialog: action.key};
        case 'CLOSE_META_DIALOG':
            return {...state, openDialog: null};
        case 'REQUEST_EXPORT_GRID_SHAPE':
            return {...state, requestingExport: true};
        case 'RECEIVE_EXPORT_GRID_SHAPE':
            return {...state, requestingExport: false};
        case 'REQUEST_IMPORT_GRID_SHAPE':
            return {...state, requestingImport: true};
        case 'RECEIVE_IMPORT_GRID_SHAPE':
            return {...state, requestingImport: false};
        case 'REQUEST_GRID_SHAPE_INDEX':
            return {...state, requestingGridShapeIndex: true};
        case 'RECEIVE_GRID_SHAPE_INDEX':
            return {...state, requestingGridShapeIndex: false, gridShapeIndex: action.data};
        case 'REQUEST_PUZZLE_INDEX':
            return {...state, requestingPuzzleIndex: true};
        case 'RECEIVE_PUZZLE_INDEX_SUCCESS':
            return {...state,
              requestingPuzzleIndex: false,
              puzzleIndexRequestError: null,
              puzzleIndex: action.data,
            };
        case 'RECEIVE_PUZZLE_INDEX_ERROR':
            return {...state,
              requestingPuzzleIndex: false,
              puzzleIndexRequestError: action.error,
            };
        case 'REQUEST_PUZZLE':
            return {...state, requestingPuzzle: true};
        case 'RECEIVE_PUZZLE_SUCCESS':
            return {...state,
                requestingPuzzle: false,
                puzzleRequestError: null,
            };
        case 'RECEIVE_PUZZLE_ERROR':
            return {...state,
                requestingPuzzle: false,
                puzzleRequestError: action.error,
            };
        default:
            return state;
    }
};
