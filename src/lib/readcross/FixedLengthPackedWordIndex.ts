import {PackedTrie} from 'tiny-trie/lib/PackedTrie';
import { AbstractFixedLengthWordIndex } from './AbstractFixedLengthWordIndex';


/**
 * A compressed fixed length word index optimized for fast initiation. Supports
 * wildcard searches with '*'.
 */
export class FixedLengthPackedWordIndex extends AbstractFixedLengthWordIndex {

    constructor(cardinality: number, dawg: string) {
        super(cardinality);
        if (!dawg) {
            throw new Error(`Packed word index must be constructed with DAWG.`);
        }
        this._trie = new PackedTrie(dawg);
        this._preprocess();
    }

    /**
     * Implementation of #add. This should just be an error for PackedTries,
     * which are assumed to be final. They are optimized for read access and
     * would be very expensive and complicated to update.
     * @param {string} word
     * @private
     */
    _addWord(word: string) {
        throw new Error(`Can't add word to packed word index.`);
    }

    /**
     * Implements wildcard matching in the packed trie using '*' as placeholder.
     * @param {string} pattern
     * @returns {string[]}
     * @private
     */
    _matchWords(pattern: string) {
        return this._trie.search(pattern, {wildcard: '*'}) as string[];
    }

    /**
     * Implements wildcard testing in the packed trie using '*' as placeholder.
     * @param {string} pattern
     * @private
     */
    _testPattern(pattern: string) {
        return this._trie.test(pattern, {wildcard: '*'});
    }

    /**
     * Preprocess trie to pull out full list of words, so that the common query
     * of "all words of length n" is fully optimized.
     */
    private _preprocess() {
        const {_allWords} = this;
        // TODO optimize
        const fullWordSet = this._matchWords(this._allWildPattern);
        fullWordSet.forEach(word => _allWords.add(word));
    }

}
