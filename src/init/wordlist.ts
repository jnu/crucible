import * as wl_nyt16Year from 'data/dist/nyt16Year';
import {loadWordList} from '../actions';
import type {Store} from '../store';

/**
 * Initialize Crucible.
 */
export function init(store: Store) {
  store.dispatch(loadWordList(wl_nyt16Year.id));
}
