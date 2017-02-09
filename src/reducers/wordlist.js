import Immutable from 'immutable';


const DEFAULT_WORDLIST_STATE = Immutable.fromJS({
    ready: false,
    fetching: false,
    error: null
});

export const wordlist = (state = DEFAULT_WORDLIST_STATE, action) => {
    switch (action.type) {
        case 'REQUEST_WORDLIST':
            return state
                .set('fetching', true)
                .set('error', null);
        case 'RECEIVE_WORDLIST_SUCCESS':
            return state
                .set('fetching', false)
                .set('error', null)
                .set('lists', state.get('lists').set(action.key, action.data));
        case 'RECEIVE_WORDLIST_ERROR':
            return state
                .set('fetching', true)
                .set('error', action.error || 'unknown error');
        default:
            return state;
    }
};
