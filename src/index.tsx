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
import {initWordList} from './init/wordlist';
import {store} from './store';
import type {Wordlist} from './lib/readcross';
import type {WordBank} from './lib/readcross/WordBank';
import {CUSTOM_MASK} from './const';

const crux = require<any>('./lib/crux');

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

// Set up auto-saver for puzzles
const puzzleAutoSaver = new AutoSave<GridState>({
  key: 'puzzle',
  getState: () => {
    const {grid} = store.getState();
    return grid;
  },
  serialize: (grid) => {
    return crux.write(grid);
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
puzzleAutoSaver.start();

// Set up auto-saver for word banks
const wordBankAutoSaver = new AutoSave<{id: string; wordbank?: WordBank}>({
  key: 'wordlist',
  getState: () => {
    const {wordlist} = store.getState();
    const maskList = wordlist.lists[CUSTOM_MASK];
    if (!maskList) {
      return {id: CUSTOM_MASK};
    }
    return {id: CUSTOM_MASK, wordbank: maskList};
  },
  serialize: (state) => {
    if (!state.wordbank) {
      return '[]';
    }
    return JSON.stringify(state.wordbank);
  },
  storageClient,
});

// Init word list data.
// TODO all things should init through functions like this.
initWordList(store).then(() => {
  wordBankAutoSaver.start();
});

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
