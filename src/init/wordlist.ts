import * as wl_broda from 'data/dist/broda';
import {loadWordList} from '../actions';
import type {Store} from '../store';
import {CUSTOM_MASK, CUSTOM_WORDS} from '../const';

/**
 * Initialize word lists used in Crucible.
 */
export const initWordList = (store: Store) => {
  return Promise.all([
    store.dispatch(loadWordList(wl_broda.id)),
    store.dispatch(loadWordList(CUSTOM_MASK, true)),
    store.dispatch(loadWordList(CUSTOM_WORDS)),
  ]);
}
