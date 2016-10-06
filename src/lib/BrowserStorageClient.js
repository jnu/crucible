export class BrowserStorageClient {

    constructor(storage) {
        this._storage = storage;
    }

    save(domain, key, value) {
        const location = this._getNamespacedKey(domain, key);
        const hasItem = this._storage.getItem(location) !== null;
        this._storage.setItem(location, JSON.stringify(value));

        // Update index as well if the key is new.
        if (!hasItem) {
            const idxKey = this._getNamespacedKey(domain);
            const idx = this._storage.getItem(idxKey);
            this._storage.setItem(idxKey, idx ? `${idx}\0${key}` : key);
        }

        return Promise.resolve();
    }

    load(domain, key, value) {
        const location = this._getNamespacedKey(domain, key);
        const val = this._storage.getItem(location);
        return val === null ?
            Promise.reject({ code: 404 }) :
            Promise.resolve(JSON.parse(val));
    }

    remove(domain, key) {
        const location = this._getNamespacedKey(domain, key);
        const hasItem = this._storage.getItem(location) !== null;
        this._storage.removeItem(location);

        // Update index if removal was successful.
        if (hasItem) {
            const idxKey = this._getNamespacedKey(domain, key);
            const idx = this._storage.getItem(idxKey);
            const newIdx = idx.split('\0').filter(key => key !== key).join('\0');
            this._storage.setItem(idxKey, newIdx);
        }

        return Promise.resolve();
    }

    index(domain) {
        const location = this._getNamespacedKey(domain);
        const idx = this._storage.getItem(location);
        return Promise.resolve(idx ? idx.split('\0') : []);
    }

    _getNamespacedKey(domain, key = null) {
        return (key === null) ? `$${domain}$index` : `$${domain}$/${key}`;
    }

}
