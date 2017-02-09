import { WordListClient } from './WordListClient';
import { WordBank } from './WordBank';
import { WordBankMeta, WL_TYPE_CUSTOM, WL_TYPE_PREMADE } from './WordBankMeta';


export class WordList {

    constructor(opts) {
        this._client = new WordListClient({ local: opts.local });
        this._banks = new Map();
    }

    getLists(key) {
        return Array.from(this._banks.values());
    }

    search(token) {
        const results = {};
        const queries = [];
        for (let [key, bank] of this._banks) {
            queries.push(
                bank
                    .search(token)
                    .then(result => {
                        results[key] = result;
                    })
            );
        }
        return Promise.all(queries).then(() => results);
    }

    createList(key) {
        const wb = new WordBank();
        this._banks.set(key, new WordBankMeta(key, WL_TYPE_CUSTOM, wb));
    }

    saveList(key) {
        // TODO
    }

    updateList(key, word) {
        // TODO. Premade lists cannot be modified, but can custom lists? how?
    }

    /**
     * Kickoff requests for initial word lists.
     * @private
     */
    loadList(key) {
        return this._client.load(key).then(bank => this._banks.set(
            key,
            new WordBankMeta(key, WL_TYPE_PREMADE, bank)
        ));
    }

}


/**
 * WordBanks to preload
 * @type {String[]}
 */
WordList.DEFAULT_LISTS = [
    wl_nyt16Year.id
];
