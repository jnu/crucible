import {PackedTrie} from 'tiny-trie/lib/PackedTrie';
import {AbstractFixedLengthWordIndex} from './AbstractFixedLengthWordIndex';

/**
 * A compressed fixed length word index optimized for fast initiation. Supports
 * wildcard searches with '*'.
 */
export class FixedLengthPackedWordIndex extends AbstractFixedLengthWordIndex {
  public static type: 'fixedLengthPackedWordIndex';

  public static fromJSON(obj: {cardinality: number; dawg: string}) {
    return new FixedLengthPackedWordIndex(obj.cardinality, obj.dawg);
  }

  private _dawg: string;

  constructor(cardinality: number, dawg: string) {
    super(cardinality);
    if (!dawg) {
      throw new Error(`Packed word index must be constructed with DAWG.`);
    }
    // TODO(jnu) give tiny-trie some way to recover the trie instead of keeping it here redundantly.
    this._dawg = dawg;
    this._trie = new PackedTrie(dawg);
    this._preprocess();
  }

  toJSON() {
    return {
      cardinality: this._cardinality,
      dawg: this._dawg,
    };
  }

  /**
   * Implementation of #add. This should just be an error for PackedTries,
   * which are assumed to be final. They are optimized for read access and
   * would be very expensive and complicated to update.
   * @param {string} word
   * @private
   */
  _addWord() {
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
    fullWordSet.forEach((word) => _allWords.add(word));
  }
}
