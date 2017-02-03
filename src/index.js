import React from 'react';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { crucibleApp } from './reducers';
import { App } from './components/App';
import { debounce } from 'lodash';
import {
    setScreenSize,
    autoSaveStart,
    autoSaveSuccess,
    autoSaveError
} from './actions';
import { AutoSave } from './lib/AutoSave';
import { storageClient } from './lib';
import { WordBank } from './lib/readcross';
const injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();


const loggerMiddleware = createLogger();

const store = createStore(
    crucibleApp,
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    )
);


/**
 * Maximum width of the app. Enforced by stylesheet.
 * @constant {Number}
 */
const MAX_APP_WIDTH = 900;


// Monitor screen size for advanced layout calculations.
const doResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    store.dispatch(setScreenSize(Math.min(width, MAX_APP_WIDTH), height));
};
window.addEventListener('resize', debounce(doResize, 50));
// Trigger once on init.
doResize();


// Set up auto-saver
const autosaver = new AutoSave({
    getState: () => {
        const { grid } = store.getState();
        return grid;
    },
    storageClient,
    onSaveStart: () => store.dispatch(autoSaveStart()),
    onSaveSuccess: grid => store.dispatch(autoSaveSuccess(grid)),
    onSaveError: e => store.dispatch(autoSaveError(e))
});
autosaver.start();


render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);


if (DEBUG) {
    window.UTIL = {
        store,
        actions: require('./actions'),
        storageClient: require('./lib').storageClient
    };
}
