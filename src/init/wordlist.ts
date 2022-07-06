import * as wl_broda from 'data/dist/broda';
import {loadWordList} from '../actions';
import type {Store} from '../store';

/**
 * Initialize Crucible.
 */
export function init(store: Store) {
  store.dispatch(loadWordList(wl_broda.id));
}
