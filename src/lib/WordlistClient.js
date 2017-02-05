import wl_nyt16Year from 'data/dist/nyt16Year';


const WORDLIST_KEY = 'wordlist';


export class WordlistClient {

    constructor(opts) {
        this._cache = opts.local;
    }

    _primeCache() {
        this._cache.save(WORDLIST_KEY, 'nyt16Year', wl_nyt16Year);
    }

    load(key) {
        // TODO. Load from cache or remote, instantiate wordlist.
    }

}
