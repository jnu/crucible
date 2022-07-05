import type {Action} from '../actions';
import type {Wordlist} from '../lib/readcross';

/**
 * State of the wordlist store.
 */
export type WordlistState = Readonly<{
  fetching: Set<string>;
  error: Error | null;
  lists: Wordlist;
}>;

/**
 * Wordlist store empty state.
 */
const DEFAULT_WORDLIST_STATE: WordlistState = {
  fetching: new Set(),
  error: null,
  lists: {},
};

/**
 * Reduce actions related to the wordlist store.
 */
export const wordlist = (
  state = DEFAULT_WORDLIST_STATE,
  action: Action,
): WordlistState => {
  switch (action.type) {
    case 'REQUEST_WORDLIST':
      state.fetching.add(action.key);
      return {...state, error: null, fetching: state.fetching};
    case 'RECEIVE_WORDLIST_SUCCESS':
      state.fetching.delete(action.key);
      const lists = {...state.lists, [action.key]: action.data};
      return {...state, fetching: state.fetching, error: null, lists};
    case 'RECEIVE_WORDLIST_ERROR':
      const error = action.error || new Error('unknown error');
      state.fetching.delete(action.key);
      return {...state, fetching: state.fetching, error};
    default:
      return state;
  }
};
