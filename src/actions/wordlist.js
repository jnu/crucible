import { wordlistClient } from '../lib';


export const loadWordlist = key => {
    return (dispatch, getState) => {
        dispatch({ type: 'REQUEST_WORDLIST' });
        wordlistClient
            .load(key)
            .then(({ key, data }) => {
                dispatch({
                    type: 'RECEIVE_WORDLIST_SUCCESS',
                    key,
                    data
                });
            })
            .catch(error => {
                dispatch({ type: 'RECEIVE_WORDLIST_ERROR', error });
            });
    };
};
