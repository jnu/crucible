/** eslint-env: browser */
import { BrowserStorageClient } from './BrowserStorageClient';
import { Wordlist } from './readcross';


const browserStorageClient = new BrowserStorageClient(window.localStorage);


export const storageClient = browserStorageClient;

export const wordlist = new WordList({ local: browserStorageClient });
