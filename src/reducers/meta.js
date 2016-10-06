import Immutable from 'immutable';


const DEFAULT_META_STATE = Immutable.fromJS({
});

export const meta = (state = DEFAULT_META_STATE, action) => {
    switch (action.type) {
        default:
            return state;
    }
};
