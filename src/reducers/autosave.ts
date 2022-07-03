import type { ReplaceGrid, AutoSaveGridStart, AutoSaveSuccess, AutoSaveError } from '../actions/storage';

/**
 * Represent state of the automatic saving feature.
 */
export type AutoSaveState = Readonly<{
  lastSaved: number | null;
  isSaving: boolean;
  lastState: AutoSaveState | null;
  lastError: Error | null;
}>;


/**
 * Blank state for the "autosave" store.
 */
const DEFAULT_AUTOSAVE_STATE: AutoSaveState = {
    lastSaved: null,
    isSaving: false,
    lastState: null,
    lastError: null,
};

/**
 * Actions pertaining to the auto-save feature.
 */
export type AutoSaveActions = ReplaceGrid | AutoSaveGridStart | AutoSaveSuccess | AutoSaveError;

/**
 * Autosave reducer.
 */
export const autosave = (state = DEFAULT_AUTOSAVE_STATE, action: AutoSaveActions) => {
    switch (action.type) {
        case 'REPLACE_GRID':
            return DEFAULT_AUTOSAVE_STATE;
        case 'AUTOSAVE_GRID_START':
            return {...state, isSaving: true};
        case 'AUTOSAVE_GRID_SUCCESS':
            return {
              isSaving: false,
              lastState: action.state,
              lastSaved: Date.now(),
              lastError: null,
            };
        case 'AUTOSAVE_GRID_ERROR':
            return {
              ...state,
              isSaving: false,
              lastError: action.error,
            };
        default:
            return state;
    }
};
