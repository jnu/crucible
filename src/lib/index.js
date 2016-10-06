import { BrowserStorageClient } from './BrowserStorageClient';


export const storageClient = new BrowserStorageClient(window.localStorage);
window.sc= storageClient
