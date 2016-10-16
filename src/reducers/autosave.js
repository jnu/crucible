import Immutable from 'immutable';


const DEFAULT_AUTOSAVE_STATE = Immutable.fromJS({
    lastSaved: null,
    isSaving: false,
    lastState: null,
    lastError: null
});

export const autosave = (state = DEFAULT_AUTOSAVE_STATE, action) => {
    switch (action.type) {
        case 'REPLACE_GRID':
            return DEFAULT_AUTOSAVE_STATE;
        case 'AUTOSAVE_GRID_START':
            return state.set('isSaving', true);
        case 'AUTOSAVE_GRID_SUCCESS':
            return state
                .set('isSaving', false)
                .set('lastState', action.state)
                .set('lastSaved', Date.now())
                .set('lastError', null);
        case 'AUTOSAVE_GRID_ERROR':
            return state
                .set('isSaving', false)
                .set('lastError', action.error);
        default:
            return state;
    }
};
