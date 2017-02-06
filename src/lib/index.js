import { BrowserStorageClient } from './BrowserStorageClient';
import { WordlistClient } from './WordlistClient';


const browserStorageClient = new BrowserStorageClient(window.localStorage);


export const storageClient = browserStorageClient;

export const wordlistClient = new WordlistClient({ local: browserStorageClient });
