import {WordListClient} from './readcross/index';
import {MemoryStorageClient} from './MemoryStorageClient';
import {BrowserStorageClient} from './BrowserStorageClient';

/**
 * General app storage goes in LocalStorage.
 */
export const storageClient = new BrowserStorageClient(window.localStorage);

/**
 * The wordlists are too big these days to fit in local storage(!), so just
 * keep them in memory. The browser's cache will make sure they're not loaded
 * too frequently over the network.
 */
export const wordlistClient = new WordListClient({
  local: new MemoryStorageClient(),
});
