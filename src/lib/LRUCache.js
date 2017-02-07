
const IDENT = x => x;

/**
 * TODO tests, more efficient implementation using self-balancing tree
 */
export class LRUCache {

    constructor(size, key = IDENT) {
        this._size = size;
        this._items = new Map();
        this._getKey = key;
    }

    has(item) {
        const key = this._getKey(item);
        return this._isKeyInCache(key);
    }

    get(item) {
        const key = this._getKey(item);
        if (this._isKeyInCache(key)) {
            const entry = this._items.get(key);
            entry.ts = LRUCache.now();
            return entry.val;
        }
    }

    _isKeyInCache(key) {
        return this._items.has(key);
    }

    add(item) {
        const key = this._getKey(item);
        if (this._isKeyInCache(key)) {
            this._items.get(key).ts = LRUCache.now();
        } else {
            this._items.insert(key, {
                ts: LRUCache.now(),
                val: item
            });
            this._prune();
        }
    }

    _prune() {
        // No need to prune when cache isn't full
        if (this._items.size < this._size) {
            return;
        }

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
