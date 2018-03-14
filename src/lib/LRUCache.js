/**
 * Identity function
 * @param  {any} x
 * @return {any}
 */
const IDENT = x => x;


/**
 * Simple Cache with least-recently-used invalidation and no expiration.
 *
 * TODO tests, more efficient implementation using self-balancing tree
 */
export class LRUCache {

    constructor(size, key = IDENT) {
        if (!size) {
            throw new Error('LRUCache must be constructed with size.');
        }
        this._size = size;
        this._items = new Map();
        this._getKey = key;
    }

    get size() {
        return this._size;
    }

    has(item) {
        const key = this._getKey(item);
        return this.hasKey(key);
    }

    hasKey(key) {
        return this._items.has(key);
    }

    get(item) {
        const key = this._getKey(item);
        return this.getByKey(key);
    }

    getByKey(key) {
        if (this.hasKey(key)) {
            const entry = this._items.get(key);
            entry.ts = LRUCache.now();
            return entry.val;
        }
    }

    add(item) {
        const key = this._getKey(item);
        if (this.hasKey(key)) {
            this._items.get(key).ts = LRUCache.now();
        } else {
            // Find and drop oldest item if cache is full.
            if (this._items.size === this._size) {
                this._dropOldest();
            }
            // Add new item.
            this._items.set(key, {
                ts: LRUCache.now(),
                val: item
            });
        }
        return key;
    }

    _dropOldest() {
        let minKey = null;
        let minTs = Infinity;
        for (let [key, entry] of this._items) {
            if (entry.ts < minTs) {
                minTs = entry.ts;
                minKey = key;
            }
        }

        if (minKey === null && minTs === Infinity) {
            throw new Error('Error finding LRU entry');
        }

        this._items.delete(minKey);
    }

}

LRUCache.now = () => Date.now();