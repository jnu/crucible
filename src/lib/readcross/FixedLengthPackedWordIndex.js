import PackedTrie from 'tiny-trie/lib/PackedTrie';
import { AbstractFixedLengthWordIndex } from './AbstractFixedLengthWordIndex';


/**
 * A compressed fixed length word index optimized for fast initiation. Supports
 * wildcard searches with '*'.
 */
export class FixedLengthPackedWordIndex extends AbstractFixedLengthWordIndex {

    constructor(cardinality, dawg) {
        super(cardinality);
        this._trie = new PackedTrie(dawg);
    }

    /**
     * Implementation of #add. This should just be an error for PackedTries,
     * which are assumed to be final. They are optimized for read access and
     * would be very expensive and complicated to update.
     * @param {String} word
     */
    _addWord(word) {
        throw new Error(`Can't add word to packed word index.`);
    }

    /**
     * Preprocess trie to pull out full list of words, so that the common query
     * of "all words of length n" is fully optimized.
     */
    _preprocess() {
        const { _allWords, _trie } = this;
        // TODO optimize
        const fullWordSet = this._matchWords(this._allWildPattern);
        fullWordSet.forEach(word => _allWords.add(word));
    }

    /**
     * Implements wildcard matching in the packed trie using '*' as placeholder.
     * @param  {String} pattern
     * @return {String[]}
     */
    _matchWords(pattern) {
        const { _trie, _cardinality } = this;

        // Tokenize search string
        const tokens = pattern.split('');

        // Result set
        const matches = [];

        // Do a BFS over nodes, tracking results in matches array.
        const nodesQueue = [{ memo: '', offset: 0, depth: 0 }];
        const lastDepth = _cardinality - 1;
        while (nodesQueue.length) {
            let curNode = nodesQueue.shift();
            console.log(curNode);
            console.log(_trie);
        }
    }

}
