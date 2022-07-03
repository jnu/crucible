import { wordlistClient } from '../lib/index';
import type {WordBank} from '../lib/readcross/WordBank';
import type {Dispatch, GetState} from '../store';

/**
 * Fetch a new wordlist.
 */
const requestWordlist = (key: string) => ({ type: 'REQUEST_WORDLIST', key } as const);

/**
 * Action to fetch a new wordlist.
 */
export type RequestWordlist = ReturnType<typeof requestWordlist>;

/**
 * Receive a wordlist.
 */
const receiveWordlistSuccess = (key: string, data: WordBank) => ({
  type: 'RECEIVE_WORDLIST_SUCCESS',
  key,
  data,
} as const);

/**
 * Action to receive wordlist.
 */
export type ReceiveWordlistSuccess = ReturnType<typeof receiveWordlistSuccess>;

/**
 * Fail to receive wordlist.
 */
const receiveWordlistError = (key: string, error: Error) => ({
  type: 'RECEIVE_WORDLIST_ERROR',
  key,
  error,
} as const);

/**
 * Action to signal failure loading wordlist.
 */
export type ReceiveWordlistError = ReturnType<typeof receiveWordlistError>;

/**
 * Load the word list with the given key.
 */
export const loadWordList = (key: string) => {
    return (dispatch: Dispatch, _getState: GetState) => {
        dispatch(requestWordlist(key));
        wordlistClient
            .load(key)
            .then(data => {
                dispatch(receiveWordlistSuccess(key, data));
            })
            .catch(error => {
                dispatch(receiveWordlistError(key, error));
            });
    };
};
