import { wordlistClient } from '../lib/index';

/**
 * Load the word list with the given key.
 */
export const loadWordList = (key: string) => {
    return (dispatch, getState) => {
        dispatch({ type: 'REQUEST_WORDLIST', key });
        wordlistClient
            .load(key)
            .then(data => {
                dispatch({
                    type: 'RECEIVE_WORDLIST_SUCCESS',
                    key,
                    data
                });
            })
            .catch(error => {
                dispatch({ type: 'RECEIVE_WORDLIST_ERROR', error, key });
            });
    };
};
