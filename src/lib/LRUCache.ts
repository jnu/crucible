/**
 * Track a cache item with its last access time.
 */
interface ICacheEntry<T> {
  ts: number;
  readonly val: T;
}

/**
 * Simple Cache with least-recently-used invalidation and no expiration.
 *
 * TODO tests, more efficient implementation using self-balancing tree
 */
export class LRUCache<T, U> {
  public static now() {
    return Date.now();
  }

  private _size: number;

  private _items: Map<U, ICacheEntry<T>>;

  private _getKey: <T>(x: T) => U;

  constructor(size: number, key = <T>(x: T) => x as unknown as U) {
    if (!size) {
      throw new Error('LRUCache must be constructed with size.');
    }
    this._size = size;
    this._items = new Map<U, ICacheEntry<T>>();
    this._getKey = key;
  }

  get size() {
    return this._size;
  }

  has(item: T) {
    const key = this._getKey(item);
    return this.hasKey(key);
  }

  hasKey(key: U) {
    return this._items.has(key);
  }

  get(item: T) {
    const key = this._getKey(item);
    return this.getByKey(key);
  }

  getByKey(key: U) {
    if (this.hasKey(key)) {
      const entry = this._items.get(key)!;
      entry.ts = LRUCache.now();
      return entry.val;
    }
  }

  add(item: T) {
    const key = this._getKey(item);
    return this.addByKey(key, item);
  }

  addByKey(key: U, item: T) {
    if (this.hasKey(key)) {
      this._items.get(key)!.ts = LRUCache.now();
    } else {
      // Find and drop oldest item if cache is full.
      if (this._items.size === this._size) {
        this._dropOldest();
      }
      // Add new item.
      this._items.set(key, {
        ts: LRUCache.now(),
        val: item,
      });
    }
    return key;
  }

  _dropOldest() {
    let found = false;
    let minKey: U;
    let minTs = Infinity;
    for (let [key, entry] of this._items) {
      if (entry.ts < minTs) {
        found = true;
        minTs = entry.ts;
        minKey = key;
      }
    }

    if (!found) {
      throw new Error('Error finding LRU entry');
    }

    this._items.delete(minKey!);
  }
}
