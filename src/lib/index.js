/** eslint-env: browser */
import { BrowserStorageClient } from './BrowserStorageClient';
import { WordListClient } from './readcross';


const browserStorageClient = new BrowserStorageClient(window.localStorage);


export const storageClient = browserStorageClient;

export const wordlistClient = new WordListClient({ local: browserStorageClient });
