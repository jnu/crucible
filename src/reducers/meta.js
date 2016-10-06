import Immutable from 'immutable';


const DEFAULT_META_STATE = Immutable.fromJS({
    openDialog: null,
    requestingExport: false,
    requestingImport: false,
    requestingGridShapeIndex: false,
    gridShapeIndex: []
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
        default:
            return state;
    }
};
