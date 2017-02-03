import { Trie } from 'tiny-trie';


/**
 * A fixed length word index that supports wildcard searches.
 */
export class FixedLengthWordIndex {

    constructor(cardinality) {
        if (cardinality === undefined) {
            throw new Error('Index must be constructed with a cardinality.');
        }
        this._wordsBuffer = [];
        this._cardinality = cardinality;
        this._trie = new Trie();
        this._allWords = new Set();
        this._allWildPattern = '*'.repeat(cardinality);
    }

    /**
     * Add words to index's input buffer. Use #commit to commit them into the
     * search index.
     * @param {String} word - word with length of `cardinality`
     */
    add(word) {
        const { _cardinality } = this;
        if (word.length !== _cardinality) {
            throw new Error(`Cannot insert word of length ${word.length} into index with cardinality ${_cardinality}`);
        }
        this._wordsBuffer.push(word);
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
     * Match words in trie either exactly or using wildcards.
     * @param  {String} pattern - search string, using `*` for a wildcard.
     * @return {String[]}
     */
    match(pattern) {
        const { _trie, _allWords, _allWildPattern, _cardinality } = this;
        const { root } = _trie;

        // Optimize special case to match everything.
        if (pattern === _allWildPattern) {
            return Array.from(_allWords);
        }

        // Queue of nodes to search
        const nodesQueue = [{ memo: '', nodeRoot: root, depth: 0 }];

        // Tokenize the search string
        const tokens = pattern.split('');

        // Since this trie only contains words of a certain length, bail if the
        // search string doesn't also have that length.
        if (tokens.length !== _cardinality) {
            return [];
        }

        // Results array
        const matches = [];
        const lastDepth = _cardinality - 1;
        // BFS over matched nodes, adding matches to results array.
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
