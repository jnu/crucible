import Immutable from 'immutable';


const DEFAULT_META_STATE = Immutable.fromJS({
    openDialog: null,
    requestingExport: false,
    requestingImport: false,
    requestingGridShapeIndex: false,
    gridShapeIndex: [],
    requestingPuzzle: false,
    puzzleRequestError: null,
    requestingPuzzleIndex: false,
    puzzleIndexRequestError: null,
    puzzleIndex: []
});

export const meta = (state = DEFAULT_META_STATE, action) => {
    switch (action.type) {
        case 'OPEN_META_DIALOG':
            return state.set('openDialog', action.key);
        case 'CLOSE_META_DIALOG':
            return state.set('openDialog', null);
        case 'REQUEST_EXPORT_GRID_SHAPE':
            return state.set('requestingExport', true);
        case 'RECEIVE_EXPORT_GRID_SHAPE':
            return state.set('requestingExport', false);
        case 'REQUEST_IMPORT_GRID_SHAPE':
            return state.set('requestingImport', true);
        case 'RECEIVE_IMPORT_GRID_SHAPE':
            return state.set('requestingImport', false);
        case 'REQUEST_GRID_SHAPE_INDEX':
            return state.set('requestingGridShapeIndex', true);
        case 'RECEIVE_GRID_SHAPE_INDEX':
            return state
                .set('requestingGridShapeIndex', false)
                .set('gridShapeIndex', Immutable.fromJS(action.data));
        case 'REQUEST_PUZZLE_INDEX':
            return state.set('requestingPuzzleIndex', true);
        case 'RECEIVE_PUZZLE_INDEX_SUCCESS':
            return state
                .set('requestingPuzzleIndex', false)
                .set('puzzleIndexRequestError', null)
                .set('puzzleIndex', Immutable.fromJS(action.data));
        case 'RECEIVE_PUZZLE_INDEX_ERROR':
            return state
                .set('requestingPuzzleIndex', false)
                .set('puzzleIndexRequestError', action.error);
        case 'REQUEST_PUZZLE':
            return state.set('requestingPuzzle', true);
        case 'RECEIVE_PUZZLE_SUCCESS':
            return state
                .set('requestingPuzzle', false)
                .set('requestPuzzleError', null);
        case 'RECEIVE_PUZZLE_ERROR':
            return state
                .set('requestingPuzzle', false)
                .set('puzzleRequestError', action.error);
        default:
            return state;
    }
};
