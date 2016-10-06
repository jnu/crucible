import Immutable from 'immutable';


const DEFAULT_SCREEN_STATE = Immutable.fromJS({
    viewportWidth: 0,
    viewportHeight: 0
});


export const rUpdateScreenSize = (state, action) => {
    const { width, height } = action;
    return state.withMutations(mutState => {
        if (width) {
            mutState.set('viewportWidth', width);
        }
        if (height) {
            mutState.set('viewportHeight', height);
        }
        return mutState;
    });
};


export const screen = (state = DEFAULT_SCREEN_STATE, action) => {
    switch (action.type) {
        case 'SCREEN_RESIZE':
            return rUpdateScreenSize(state, action);
        default:
            return state;
    }
};
