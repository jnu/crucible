import type {Action} from '../actions';
import type {ScreenResize} from '../actions/meta';

/**
 * Initial state of the screen.
 */
const DEFAULT_SCREEN_STATE = {
    viewportWidth: 0,
    viewportHeight: 0
};

/**
 * Represent state of the screen (viewport).
 */
export type ScreenState = Readonly<typeof DEFAULT_SCREEN_STATE>;

/**
 * Apply screen state updates.
 */
export const rUpdateScreenSize = (state: ScreenState, action: ScreenResize) => {
    const { width, height } = action;
    if (!width && !height) {
      return state;
    }

    return {
      ...state,
      viewportwidth: width || state.viewportWidth,
      viewportHeight: height || state.viewportHeight,
    };
};

/**
 * Reducer to apply screen state updates.
 */
export const screen = (state = DEFAULT_SCREEN_STATE, action: Action) => {
    switch (action.type) {
        case 'SCREEN_RESIZE':
            return rUpdateScreenSize(state, action);
        default:
            return state;
    }
};
