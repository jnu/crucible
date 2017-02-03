import { FixedLengthWordIndex } from './FixedLengthWordIndex';


/**
 * An arbitrary-length word index that supports wildcard matching.
 */
export class WordBank {

    constructor(words) {
        this._indexes = [];
        if (words) {
            this._fromWordsArray(words);
        }
    }

    /**
     * Insert a word or words into the word bank.
     * @param  {String|String[]} word - single word or array of words
     */
    insert(word) {
        this._fromWordsArray(Array.isArray(word) ? word : [word]);
    }

    /**
     * Find all tokens matching input string. Search supports `*` wildcard to
     * match any token.
     * @param  {String} token
     * @return {String[]}
     */
    search(token) {
        const { _indexes } = this;
        const len = token.length;
        const index = _indexes[len];

        // Return immediately if index does not exist.
        if (!index) {
            return Promise.resolve([]);
        }

        return Promise.resolve(index.match(token));
    }

    /**
     * Insert the given words into the appropriate indexes.
     * @private
     * @param  {String[]} words
     */
    _fromWordsArray(words) {
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

}
