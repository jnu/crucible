/**
 * Type that includes a key with it.
 */
export type Keyed<T> = T & {key: string};

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
   * @returns {Promise<T>}
   */
  save: <T>(domain: string, key: string, value: T) => Promise<T>;

  /**
   * Load a piece of data from storage from the given domain and key.
   * @param {string} domain
   * @param {string} key
   * @returns {Promise<Keyed<T>>}
   */
  load: <T>(domain: string, key: string) => Promise<Keyed<T>>;

  /**
   * Remove a piece of data from storage under the given domain and key.
   * @param {string} domain
   * @param {string} key
   * @returns {Promise<void>}
   */
  remove: (domain: string, key: string) => Promise<void>;

  /**
   * Fetch an index of all data in a domain.
   * @param {string} domain
   * @returns {Promise<Keyed<T>[]>}
   */
  index: <T>(domain: string) => Promise<Keyed<T>[]>;
}
