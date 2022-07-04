import thunkMiddleware from 'redux-thunk';
import {createLogger} from 'redux-logger';
import {
  useDispatch as _useDispatch,
  useSelector as _useSelector,
} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';

import {crucibleApp} from '../reducers';

/**
 * Crucible application redux store.
 */
export const store = createStore(
  crucibleApp,
  applyMiddleware(thunkMiddleware, createLogger()),
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

/**
 * Dispatch hook that provides the correct typing.
 */
export const useDispatch: () => Dispatch = _useDispatch as any;

/**
 * Selector hook that provides the correct typing.
 */
export const useSelector = <T>(f: (s: State) => T) => _useSelector(f);
