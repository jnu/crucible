import Immutable from 'immutable';


const DEFAULT_WORDLIST_STATE = Immutable.fromJS({
    fetching: Immutable.Set(),
    error: null,
    lists: {}
});

export const wordlist = (state = DEFAULT_WORDLIST_STATE, action) => {
    switch (action.type) {
        case 'REQUEST_WORDLIST':
            return state
                .set('fetching', state.get('fetching').add(action.key))
                .set('error', null);
        case 'RECEIVE_WORDLIST_SUCCESS':
            return state
                .set('fetching', state.get('fetching').remove(action.key))
                .set('error', null)
                .set('lists', state.get('lists').set(action.key, action.data));
        case 'RECEIVE_WORDLIST_ERROR':
            return state
                .set('fetching', state.get('fetching').remove(action.key))
                .set('error', action.error || 'unknown error');
        default:
            return state;
    }
};
