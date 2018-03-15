import { FixedLengthWordIndex } from './FixedLengthWordIndex';
import { FixedLengthPackedWordIndex } from './FixedLengthPackedWordIndex';
import { LRUCache } from '../LRUCache';


/**
 * An arbitrary-length word index that supports wildcard matching.
 */
export class WordBank {

    /**
     * Construct a word bank from frozen, encoded DAWGs. In production this should
     * be how WordBanks are instantiated, as constructing banks from raw lists will
     * be too expensive both over the wire and in init time.
     *
     * The input should be a map from word-length to a packed DAWG of words with
     * this length. See Trie#freeze and Trie#encode for expected DAWG format.
     *
     * @public
     * @static
     * @param  {{ [key: number]: String }} dawgs - map from length to packed DAWG
     * @return {WordBank}
     */
    public static fromPacked(dawgs: {[key: number]: string}) {
        const wb = new WordBank();
        wb._fromWordsDAWGs(dawgs);
        return wb;
    };

    private _cache: LRUCache<string, string>;

    private _indexes: FixedLengthPackedWordIndex[];

    constructor(words?: string[] | {[key: number]: string}, cacheSize = 10) {
        this._indexes = [];
        this._cache = new LRUCache(cacheSize);
        if (words) {
            if (Array.isArray(words)) {
                this._fromWordsArray(words as string[]);
            } else {
                this._fromWordsDAWGs(words as {[key: number]: string});
            }
        }
    }

    /**
     * Insert a word or words into the word bank.
     * @param  {String|String[]} word - single word or array of words
     */
    insert(word: string) {
        this._fromWordsArray(Array.isArray(word) ? word : [word]);
    }

    /**
     * Find all tokens matching input string. Search supports `*` wildcard to
     * match any token.
     * @param  {String} token
     * @return {String[]}
     */
    search(token: string) {
        const { _indexes, _cache } = this;

        const cached = _cache.get(token);
        if (cached) {
            return Promise.resolve(cached);
        }

        const len = token.length;
        const index = _indexes[len];

        // Return immediately if index does not exist.
        if (!index) {
            return Promise.resolve([]);
        }

        return Promise.resolve(index.match(token))
            .then(match => {
                _cache.add(match);
                return match;
            });
    }

    /**
     * Insert the given words into the appropriate indexes.
     * @private
     * @param  {String[]} words
     */
    _fromWordsArray(words: string[]) {
        const { _indexes } = this;

        // Create indexes for words by length. The length is always known, so
        // it can be used as a quick heuristic to shrink the search space.
        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            let len = word.length;
            let index = _indexes[len];
            if (!index) {
                index = _indexes[len] = new FixedLengthWordIndex(len);
            }
            index.add(word);
        }

        // Commit all of the new words to the indexes.
        _indexes.forEach(index => index.commit());
    }

    /**
     * Initialize fixed-length indexes from packed DAWGs.
     * @param  {{ [key: number]: String }} dawgs - map from length to DAWG
     */
    _fromWordsDAWGs(dawgs: {[key: number]: string}) {
        const { _indexes } = this;

        const sizes = Object.keys(dawgs);

        for (let i = 0; i < sizes.length; i++) {
            let len = +sizes[i];

            _indexes[len] = new FixedLengthPackedWordIndex(len, dawgs[len]);
        }
    }

}