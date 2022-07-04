import type { Action } from '../actions';

/**
 * Represent state of the automatic saving feature.
 */
export type AutoSaveState<T> = Readonly<{
  lastSaved: number | null;
  isSaving: boolean;
  lastState: T | null;
  lastError: Error | null;
}>;


/**
 * Blank state for the "autosave" store.
 */
const DEFAULT_AUTOSAVE_STATE: AutoSaveState<null> = {
    lastSaved: null,
    isSaving: false,
    lastState: null,
    lastError: null,
};

/**
 * Autosave reducer.
 */
export const autosave = (state = DEFAULT_AUTOSAVE_STATE, action: Action) => {
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
