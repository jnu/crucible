import type {
  ViewPdf,
  ViewEditor,
} from '../actions/view';
import type { Action } from '../actions';

/**
 * The view state.
 */
export type ViewState = {
  display: "pdf" | "editor";
}

/**
 * The initial view state.
 */
const INITIAL_STATE: ViewState = {
  display: "editor",
};

/**
 * Update the view state.
 */
export const view = (state = INITIAL_STATE, action: Action): ViewState => {
  switch (action.type) {
    case 'VIEW_PDF':
      return {
        display: "pdf",
      };
    case 'VIEW_EDITOR':
      return {
        display: "editor",
      };
    default:
      return state;
  }
}
