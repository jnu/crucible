import { WordBank } from './readcross';

import * as wl_nyt16Year from 'data/dist/nyt16Year';


/**
 * Map from wordlist key to wordlist module loading function. The module loader
 * should be an async import that resolves with a hash of word length buckets
 * to packed DAWGs, which can be used to instantiate a WordBank. (This loader
 * should be autogenerated by the wordlist tools to be compatible with the ES6
 * async import spec).
 *
 * TODO extract this to a shared manifest maintained by wordlist tools.
 *
 * @type {{ [key: string]: () => Promise<{[key: number]: String}>}}
 */
const PREMADE_LISTS = [
    wl_nyt16Year
].reduce((agg, mod) => {
    const id = mod.id;
    const load = mod.load;
    let loader = load;
    if (DEBUG) {
        loader = () => {
            console.info(`Loading wordlist ${id} ...`);
            return load();
        };
    }
    agg[id] = loader;
    return agg;
}, {});


const WORDLIST_KEY = 'wordlist';


/**
 * Manage loading of async wordlist modules.
 *
 * TODO saving custom wordlists?
 */
export class WordlistClient {

    constructor(opts) {
        this._cache = opts.local;
        this._requests = {};
        this._preload();
    }

    /**
     * Load a wordlist by key.
     * @param  {String} key
     * @return {Promise<WordBank>}
     */
    load(key) {
        // Use request cache to glom any redundant, concurrent requests for
        // the same entity.
        let req = this._requests[key];
        if (!req) {
            // Pass through values and errors from real fetch, but clear the
            // key in the requests cache so it can be refetched. Ideally the
            // underlying fetch uses some smart cache layer (even just defer
            // to the browser).
            req = this._requests[key] = this._fetchWordlistByKey(key)
                .then(v => {
                    this._requests[key] = null;
                    return v;
                })
                .catch(e => {
                    this._requests[key] = null;
                    throw e;
                });
        }
        return req;
    }

    /**
     * Kickoff requests for initial word lists.
     * @private
     */
    _preload() {
        WordlistClient.DEFAULT_LISTS.forEach(key => this.load(key));
    }

    /**
     * Fetch a wordlist from cache if possible, or load asynchronously.
     * @private
     * @param  {String} key
     * @return {Promise<WordBank>}
     */
    _fetchWordlistByKey(key) {
        return this._cache.load(WORDLIST_KEY, key)
            .then(cacheHit => cacheHit.data)
            .catch(e => PREMADE_LISTS[key]()
                .then(data => this._cache.save(WORDLIST_KEY, key, { data }))
            )
            .then(data => new WordBank(data))
            .catch(e => {
                console.error(`Failed to load wordlist ${key}.`, e);
                // TODO multitransport logging
                throw e;
            });
    }

}


/**
 * Wordlists to preload
 * @type {String[]}
 */
WordlistClient.DEFAULT_LISTS = [
    wl_nyt16Year.id
];
