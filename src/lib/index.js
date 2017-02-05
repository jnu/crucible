import { BrowserStorageClient } from './BrowserStorageClient';


const browserStorageClient = new BrowserStorageClient(window.localStorage);


export const storageClient = browserStorageClient;

export const wordlistClient = new WordlistClient({ local: browserStorageClient });
