import thunkMiddleware from 'redux-thunk';
import {createLogger} from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';

import {crucibleApp} from '../reducers';

/**
 * Crucible application redux store.
 */
export const store = createStore(
    crucibleApp,
    applyMiddleware(
        thunkMiddleware,
        createLogger(),
    )
);

/**
 * Crucible store.
 */
export type Store = typeof store;

/**
 * Crucible dispatcher.
 */
export type Dispatch = typeof store.dispatch;

/**
 * Crucible `getState` method.
 */
export type GetState = typeof store.getState;

/**
 * Crucible store state.
 */
export type State = ReturnType<GetState>;
