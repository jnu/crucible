import {Trie} from 'tiny-trie';
import {AbstractFixedLengthWordIndex} from './AbstractFixedLengthWordIndex';

/**
 * A fixed length word index that supports wildcard searches.
 */
export class FixedLengthWordIndex extends AbstractFixedLengthWordIndex {
  public static type = 'fixedLengthWordIndex';

  public static fromJSON(json: any) {
    const idx = new FixedLengthWordIndex(json.cardinality);
    idx._trie = new Trie(json.trie);
    idx._allWords = new Set(idx._trie.search(idx._allWildPattern));
    return idx;
  }

  private _wordsBuffer: string[];

  constructor(cardinality: number) {
    super(cardinality);
    this._wordsBuffer = [];
    this._trie = new Trie();
    this._allWords = new Set();
  }

  /**
   * Commit input buffer into the search index.
   */
  commit() {
    const {_trie, _wordsBuffer, _allWords} = this;
    _wordsBuffer.forEach((word) => {
      _trie.insert(word);
      _allWords.add(word);
    });
  }

  toJSON() {
    return {
      cardinality: this._cardinality,
      trie: this._trie.toJSON(),
    };
  }

  /**
   * Add words to index's input buffer.
   * NB: in this implementation, must use #commit for words to be written
   * into the index. The #add method only buffers words.
   * @param {string} word
   * @private
   */
  _addWord(word: string) {
    this._wordsBuffer.push(word);
  }

  /**
   * Match words in trie either exactly or using wildcard ('*').
   * @param {string} pattern
   * @private
   */
  _matchWords(pattern: string) {
    // TODO search the word buffer?
    return this._trie.search(pattern, {wildcard: '*'});
  }

  /**
   * Test if pattern exists in trie either exactly or using wildcard ('*').
   * @param {string} pattern
   * @private
   */
  _testPattern(pattern: string) {
    // TODO search the word buffer?
    return this._trie.test(pattern, {wildcard: '*'});
  }
}
