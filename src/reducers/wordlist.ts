import type {Action} from '../actions';
import type {Wordlist} from '../lib/readcross';
import {resetQueryCache} from '../lib/gridiron';

/**
 * State of the wordlist store.
 */
export type WordlistState = Readonly<{
  fetching: Set<string>;
  error: Error | null;
  ready: boolean;
  lists: Wordlist;
}>;

/**
 * Wordlist store empty state.
 */
const DEFAULT_WORDLIST_STATE: WordlistState = {
  fetching: new Set(),
  error: null,
  ready: false,
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
      return {...state, ready: false, error: null, fetching: state.fetching};
    case 'RECEIVE_WORDLIST_SUCCESS':
      state.fetching.delete(action.key);
      const lists = {...state.lists, [action.key]: action.data};
      return {
        ...state,
        ready: true,
        fetching: state.fetching,
        error: null,
        lists,
      };
    case 'RECEIVE_WORDLIST_ERROR':
      const error = action.error || new Error('unknown error');
      state.fetching.delete(action.key);
      return {...state, ready: false, fetching: state.fetching, error};
    case 'REMOVE_WORD':
      const rList = state.lists[action.key];
      if (!rList || !rList.mask) {
        console.error("Unable to remove word from list");
        return state;
      }
      rList.insert(action.word);
      resetQueryCache();
      return {...state};
    case 'ADD_WORD':
      const aList = state.lists[action.key];
      if (!aList || aList.mask) {
        console.error("Unable to add word to list");
        return state;
      }
      aList.insert(action.word);
      resetQueryCache();
      return {...state};
    default:
      return state;
  }
};
