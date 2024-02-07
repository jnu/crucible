import {wordlistClient} from '../lib/index';
import type {WordBank} from '../lib/readcross/WordBank';
import type {Dispatch, GetState} from '../store';
import {CUSTOM_MASK, CUSTOM_WORDS} from '../const';

/**
 * Fetch a new wordlist.
 */
const requestWordlist = (key: string) =>
  ({type: 'REQUEST_WORDLIST', key} as const);

/**
 * Action to fetch a new wordlist.
 */
export type RequestWordlist = ReturnType<typeof requestWordlist>;

/**
 * Receive a wordlist.
 */
const receiveWordlistSuccess = (key: string, data: WordBank) =>
  ({
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
const receiveWordlistError = (key: string, error: Error) =>
  ({
    type: 'RECEIVE_WORDLIST_ERROR',
    key,
    error,
  } as const);

/**
 * Action to signal failure loading wordlist.
 */
export type ReceiveWordlistError = ReturnType<typeof receiveWordlistError>;

/**
 * Remove a word from the wordlist.
 */
export const removeWord = (key: string, word: string) =>
  ({
    type: 'REMOVE_WORD',
    key,
    word,
  } as const);

/**
 * Action to remove a word from the wordlist.
 */
export type RemoveWord = ReturnType<typeof removeWord>;

/**
 * Remove word from the custom word list.
 */
export const removeCustomWord = (word: string) => removeWord(CUSTOM_MASK, word);

/**
 * Add a word to the wordlist.
 */
export const addWord = (key: string, word: string) =>
  ({
    type: 'ADD_WORD',
    key,
    word,
  } as const);

/**
 * Action to add a word to the wordlist.
 */
export type AddWord = ReturnType<typeof addWord>;

/**
 * Add word to the custom word list.
 */
export const addCustomWord = (word: string) => addWord(CUSTOM_WORDS, word);

/**
 * Load the word list with the given key.
 *
 * Optionally use the wordlist as a mask.
 */
export const loadWordList = (key: string, mask: boolean = false) => {
  return (dispatch: Dispatch, _getState: GetState) => {
    dispatch(requestWordlist(key));
    wordlistClient
      .load(key, mask)
      .then((data) => {
        dispatch(receiveWordlistSuccess(key, data));
      })
      .catch((error) => {
        dispatch(receiveWordlistError(key, error));
      });
  };
};
