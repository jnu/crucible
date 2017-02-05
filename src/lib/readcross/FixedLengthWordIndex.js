import { Trie } from 'tiny-trie';
import { AbstractFixedLengthWordIndex } from './AbstractFixedLengthWordIndex';


/**
 * A fixed length word index that supports wildcard searches.
 */
export class FixedLengthWordIndex extends AbstractFixedLengthWordIndex {

    constructor(cardinality) {
        super(cardinality);
        this._wordsBuffer = [];
        this._trie = new Trie();
    }

    /**
     * Commit input buffer into the search index.
     */
    commit() {
        const { _trie, _wordsBuffer, _allWords } = this;
        _wordsBuffer.forEach(word => {
            _trie.insert(word);
            _allWords.add(word);
        });
    }

    /**
     * Add words to index's input buffer.
     * NB: in this implementation, must use #commit for words to be written
     * into the index. The #add method only buffers words.
     * @param {String} word - word with length of `cardinality`
     */
    _addWord(word) {
        this._wordsBuffer.push(word);
    }

    /**
     * Match words in trie either exactly or using wildcards.
     * @param  {String} pattern - search string, using `*` for a wildcard.
     * @return {String[]}
     */
    _matchWords(pattern) {
        const { _trie, _cardinality } = this;
        const { root } = _trie;

        // Queue of nodes to search
        const nodesQueue = [{ memo: '', nodeRoot: root, depth: 0 }];

        // Tokenize the search string
        const tokens = pattern.split('');

        // Results array
        const matches = [];
        const lastDepth = _cardinality - 1;
        // BFS over matched nodes, adding results to matches array.
        while (nodesQueue.length) {
            let curNode = nodesQueue.shift();
            let { nodeRoot, depth, memo } = curNode;
            let token = tokens[depth];

            // Wildcard matches all of the node's children; otherwise match
            // exact token.
            let matchedTokens = (token === '*') ?
                Object.keys(nodeRoot) :
                nodeRoot.hasOwnProperty(token) ? [token] : null;

            // Continue if no children match.
            if (!matchedTokens) {
                continue;
            }

            // When search hits the trie's fixed length, send words to the
            // matches array.
            if (depth === lastDepth) {
                Array.prototype.push.apply(
                    matches,
                    matchedTokens.map(char => memo + char)
                );
            }
            // If children are non-terminal, add them to search queue.
            else {
                matchedTokens.forEach(char => {
                    nodesQueue.push({
                        nodeRoot: nodeRoot[char],
                        depth: depth + 1,
                        memo: memo + char
                    });
                });
            }
        }

        return matches;
    }

}
