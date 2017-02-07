import PackedTrie from 'tiny-trie/lib/PackedTrie';
import { AbstractFixedLengthWordIndex } from './AbstractFixedLengthWordIndex';
import { readBits } from '../readBits';


/**
 * A compressed fixed length word index optimized for fast initiation. Supports
 * wildcard searches with '*'.
 */
export class FixedLengthPackedWordIndex extends AbstractFixedLengthWordIndex {

    constructor(cardinality, dawg) {
        super(cardinality);
        if (!dawg) {
            throw new Error(`Packed word index must be constructed with DAWG.`);
        }
        this._trie = new PackedTrie(dawg);
        this._computeTrieCharTables();
        this._preprocess();
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
        const { _allWords } = this;
        // TODO optimize
        const fullWordSet = this._matchWords(this._allWildPattern);
        fullWordSet.forEach(word => _allWords.add(word));
    }

    /**
     * Cache lookup tables for characters in trie
     */
    _computeTrieCharTables() {
        const { table } = this._trie;
        this._trieCharToIdx = table;
        this._trieIdxToChar = Object.keys(table).reduce((map, char) => {
            const idx = table[char];
            map[idx] = char;
            return map;
        }, {});
    }

    /**
     * Implements wildcard matching in the packed trie using '*' as placeholder.
     * @param  {String} pattern
     * @return {String[]}
     */
    _matchWords(pattern) {
        // TODO move wildcard matching implementation out to `tiny-trie`, it's
        // been a TODO there for a while ...
        const {
            _trie,
            _cardinality,
            _trieCharToIdx,
            _trieIdxToChar
        } = this;
        const {
            pointerShift,
            pointerMask,
            charShift,
            charMask,
            wordWidth,
            lastMask,
            offset,
            data
        } = _trie;

        // Tokenize search string
        const tokens = pattern.split('');

        // Result set
        const matches = [];

        // Do a BFS over nodes, tracking results in matches array.
        const nodesQueue = [{ memo: '', wordPosition: 0, depth: 0 }];
        const lastDepth = _cardinality - 1;
        while (nodesQueue.length) {
            let curNode = nodesQueue.shift();
            let { memo, wordPosition, depth } = curNode;
            let token = tokens[depth];
            let tokenIdx = _trieCharToIdx[token];
            let isLastBlock = depth === lastDepth;

            // Scan all chunks in this level for a match
            while (true) {
                let curBitPos = wordPosition * wordWidth;
                let chunk = readBits(data, curBitPos, wordWidth);
                let charIdx = (chunk >> charShift) & charMask;
                let matchedToken = null;
                let final = false;

                // Match wildcards
                if (token === '*') {
                    matchedToken = _trieIdxToChar[charIdx];
                }
                // Match literal chars
                else if (tokenIdx === charIdx) {
                    matchedToken = token;
                    final = true;
                }

                // Add new matched token to search queue
                if (matchedToken) {
                    let pointer = (chunk >> pointerShift) & pointerMask;
                    let fullStr = memo + matchedToken;
                    if (isLastBlock) {
                        matches.push(fullStr);
                    } else {
                        nodesQueue.push({
                            memo: fullStr,
                            wordPosition: wordPosition + offset + pointer,
                            depth: depth + 1
                        });
                    }
                }

                // Stop scanning if this is the last chunk in the block.
                if (final || chunk & lastMask) {
                    break;
                }

                // Skip to next chunk.
                wordPosition += 1;
            }
        }

        return matches;
    }

}
