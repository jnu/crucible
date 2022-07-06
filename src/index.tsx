import React from 'react';
import {createRoot} from 'react-dom/client';
import {crucibleApp} from './reducers';
import type {GridState} from './reducers/grid';
import {App} from './components/App';
import {debounce} from 'lodash';
import {
  setScreenSize,
  autoSaveStart,
  autoSaveSuccess,
  autoSaveError,
} from './actions';
import {AutoSave} from './lib/AutoSave';
import {storageClient} from './lib/index';
import {init as initWordList} from './init/wordlist';
import {store} from './store';

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
const autosaver = new AutoSave<GridState>({
  getState: () => {
    const {grid} = store.getState();
    return grid;
  },
  storageClient,
  onSaveStart: () => store.dispatch(autoSaveStart()),
  onSaveSuccess: (grid) => {
    store.dispatch(autoSaveSuccess(grid));
  },
  onSaveError: (e) => {
    store.dispatch(autoSaveError(e));
  },
});
autosaver.start();

// Init word list data.
// TODO all things should init through functions like this.
initWordList(store);

// Render the app.
const root = createRoot(document.getElementById('root')!);
root.render(<App store={store} />);
// Show content
document.body.classList.remove('hidden');

// Install debug utils for local development.
if (DEBUG) {
  // @ts-ignore
  window.__app__ = {
    store,
    actions: require('./actions'),
    // @ts-ignore
    storageClient: require('./lib/index').storageClient,
    // @ts-ignore
    wordlistClient: require('./lib/index').wordlistClient,
    // @ts-ignore
    crux: require('./lib/crux'),
    // @ts-ignore
    gridiron: require('./lib/gridiron'),
  };
}
