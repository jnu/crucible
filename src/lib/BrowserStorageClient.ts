/**
 * @file Browser-based storage for application data.
 */

import {IStorageClient} from './StorageClient';


/**
 * Application storage interface that uses browser-local storage as a backend.
 *
 * API offers namespaced keys and is asynchronous.
 */
export class BrowserStorageClient implements IStorageClient {

    private _storage: Storage;

    /**
     * Instantiate the storage client with the given backend. Backends can be sessionStorage, browserStorage, or some
     * other object that implements the Storage API.
     *
     * @param {Storage} storage
     */
    constructor(private storage: Storage) {
        this._storage = storage;
    }

    /**
     * Save a value to browser storage.
     *
     * @param {string} domain
     * @param {string} key
     * @param {T} value
     * @returns {Promise<T>}
     */
    save<T>(domain: string, key: string, value: T) {
        const location = this._getNamespacedKey(domain, key);
        const hasItem = this._storage.getItem(location) !== null;
        this._storage.setItem(location, JSON.stringify(value));

        // Update index as well if the key is new.
        if (!hasItem) {
            const idxKey = this._getNamespacedKey(domain);
            const idx = this._storage.getItem(idxKey);
            this._storage.setItem(idxKey, idx ? `${idx}\0${key}` : key);
        }

        return Promise.resolve(value);
    }

    /**
     * Load a value from browser storage.
     *
     * @param {string} domain
     * @param {string} key
     * @returns {Promise<T>}
     */
    load<T>(domain: string, key: string) {
        const location = this._getNamespacedKey(domain, key);
        const val = this._storage.getItem(location);

        if (val === null) {
            return Promise.reject({ code: 404 });
        }

        const obj = Object.assign(JSON.parse(val), { key });
        return Promise.resolve(obj as T & {key: string});
    }

    /**
     * Remove a value from browser storage.
     *
     * @param {string} domain
     * @param {string} key
     * @returns {Promise<void>}
     */
    remove(domain: string, key: string) {
        const location = this._getNamespacedKey(domain, key);
        const hasItem = this._storage.getItem(location) !== null;
        this._storage.removeItem(location);

        // Update index if removal was successful.
        if (hasItem) {
            const idxKey = this._getNamespacedKey(domain, key);
            const idx = this._storage.getItem(idxKey)!;
            const newIdx = idx.split('\0').filter(id => id !== key).join('\0');
            this._storage.setItem(idxKey, newIdx);
        }

        return Promise.resolve();
    }

    /**
     * Get the index of values from browser storage.
     *
     * @param {string} domain
     * @returns {Promise<T[]>}
     */
    index<T>(domain: string) {
        const location = this._getNamespacedKey(domain);
        const idx = this._storage.getItem(location);
        const items = idx ? idx.split('\0') : [];
        // Inflate each item since it's cheap here.
        return Promise.all(items.map(item => this.load<T>(domain, item)));
    }

    _getNamespacedKey(domain: string, key: string | null = null) {
        return (key === null) ? `$${domain}$index` : `$${domain}$/${key}`;
    }

}
