import { wordlist } from '../lib';


export const loadWordList = key => {
    return (dispatch, getState) => {
        dispatch({ type: 'REQUEST_WORDLIST' });
        wordlist
            .loadList(key)
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
