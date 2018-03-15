/**
 * Application data storage interface. Can use an arbitrary backend. Stores data under namespaced keys. All methods
 * are asynchronous.
 */
export interface IStorageClient {
    /**
     * Save a piece of data using the given key under the given domain.
     * @param {string} domain
     * @param {string} key
     * @param {T} value
     * @returns {Promise<void>}
     */
    save: <T>(domain: string, key: string, value: T) => Promise<void>;

    /**
     * Load a piece of data from storage from the given domain and key.
     * @param {string} domain
     * @param {string} key
     * @returns {Promise<T>}
     */
    load: <T>(domain: string, key: string) => Promise<T>;

    /**
     * Remove a piece of data from storage under the given domain and key.
     * @param {string} domain
     * @param {string} key
     * @returns {Promise<void>}
     */
    remove: <T>(domain: string, key: string) => Promise<void>;

    /**
     * Fetch an index of all data in a domain.
     * @param {string} domain
     * @returns {Promise<T[]>}
     */
    index: <T>(domain: string) => Promise<T[]>;
}