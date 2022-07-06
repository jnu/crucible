import {IStorageClient, Keyed} from './StorageClient';

/**
 * Simple storage client that keeps things in memory.
 */
export class MemoryStorageClient implements IStorageClient {
  private _cache: Map<string, any>;

  private _indexes: Map<string, Set<string>>;

  constructor() {
    this._cache = new Map();
    this._indexes = new Map();
  }

  /**
   * Save a value under the identifier key in the given domain.
   */
  public async save<T>(domain: string, key: string, value: T) {
    const k = this._getKey(domain, key);
    this._cache.set(k, value);
    this._addToIndex(domain, key);

    return value;
  }

  /**
   * Load an item identified by key from the given domain.
   */
  public async load<T>(domain: string, key: string) {
    try {
      return this._getItem<T>(domain, key);
    } catch (e) {
      return Promise.reject({
        code: 404,
        detail: `item ${domain}-${key} not found in cache`,
      });
    }
  }

  /**
   * Remove an item identified by key from the given domain.
   */
  public async remove(domain: string, key: string) {
    const k = this._getKey(domain, key);
    this._cache.delete(k);
    this._removeFromIndex(domain, key);
  }

  /**
   * Fetch all the items in the cache for the given domain.
   */
  public async index<T>(domain: string) {
    const idx = Array.from(this._indexes.get(domain) || []);
    return idx.map((key) => this._getItem<T>(domain, key));
  }

  /**
   * Test if key is defined in given domain.
   */
  public async has(domain: string, key: string) {
    const idx = this._indexes.get(domain);
    return idx?.has(key) || false;
  }

  /**
   * Get item synchronously from cache.
   */
  private _getItem<T>(domain: string, key: string) {
    const cacheKey = this._getKey(domain, key);

    if (!this._cache.has(cacheKey)) {
      throw new Error('item not found');
    }

    const v = this._cache.get(cacheKey);

    return {...v, key} as Keyed<T>;
  }

  /**
   * Add key to index for given domain.
   */
  private _addToIndex(domain: string, key: string) {
    if (!this._indexes.has(domain)) {
      this._indexes.set(domain, new Set());
    }
    this._indexes.get(domain)!.add(key);
  }

  /**
   * Remove a key from the index for a given domain.
   */
  private _removeFromIndex(domain: string, key: string) {
    this._indexes.get(domain)?.delete(key);
  }

  /**
   * Get a cache key to use for storage.
   */
  private _getKey(domain: string, key: string) {
    return `${domain}|${key}`;
  }
}
