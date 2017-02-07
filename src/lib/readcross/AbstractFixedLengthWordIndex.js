/**
 * Base fixed-length word index implementation. Provides some common error
 * handling and optimization. Generally, interesting details are implemented in
 * subclasses in #add and #_matchWords.
 * @abstract
 * @class
 */
export class AbstractFixedLengthWordIndex {

    constructor(cardinality) {
        if (cardinality === undefined) {
            throw new Error('Index must be constructed with a cardinality.');
        }
        this._cardinality = +cardinality;
        this._allWords = new Set();
        this._allWildPattern = '*'.repeat(cardinality);
        this._trie = null;
    }

    /**
     * Add a word to the index.
     * @param {String} word - word with length of `cardinality`
     */
    add(word) {
        const { _cardinality } = this;
        if (!word) {
            throw new Error(`Cannot insert non-word ${word} into index`);
        }
        if (word.length !== _cardinality) {
            throw new Error(`Cannot insert word of length ${word.length} into index with cardinality ${_cardinality}`);
        }
        this._addWord(word);
    }

    /**
     * Match words in trie either exactly or using wildcards.
     * @param  {String} pattern - search string, using `*` for a wildcard.
     * @return {String[]}
     */
    match(pattern) {
        const { _allWildPattern, _allWords, _cardinality } = this;

        // Since this index only contains words of a certain length, bail if
        // the search string doesn't also have that length.
        if (!pattern || pattern.length !== _cardinality) {
            return [];
        }

        // Optimize special case to match everything.
        if (pattern === _allWildPattern) {
            return Array.from(_allWords);
        }

        // Otherwise defer to subclass implementation.
        return this._matchWords(pattern);
    }

    /**
     * Implementation of #add. Overwrite in subclass.
     */
    _addWord(word) {
        throw new Error('not implemented');
    }

    /**
     * Implementation of #match. Overwrite in subclass.
     */
    _matchWords(pattern) {
        throw new Error('not implemented');
    }

}
