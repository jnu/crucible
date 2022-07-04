/**
 * Base fixed-length word index implementation. Provides some common error
 * handling and optimization. Generally, interesting details are implemented in
 * subclasses in #add and #_matchWords.
 * @abstract
 * @class
 */
export abstract class AbstractFixedLengthWordIndex {
  /**
   * The word index's identifier for serialization. Set in subclass.
   * @type {string}
   */
  public static type: string = '';

  /**
   * Restore an index from its JSON serialization. See also #toJSON.
   * @param {Object} obj
   */
  public static fromJSON(obj: Object) {
    throw new Error(`not implemented / ${obj}`);
  }

  protected _cardinality: number;

  protected _allWords: Set<string>;

  protected _allWildPattern: string;

  protected _trie: any;

  constructor(cardinality: number) {
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
   * @param {string} word - word with length of `cardinality`
   */
  public add(word: string): void {
    const {_cardinality} = this;
    if (!word) {
      throw new Error(`Cannot insert non-word ${word} into index`);
    }
    if (word.length !== _cardinality) {
      throw new Error(
        `Cannot insert word of length ${word.length} into index with cardinality ${_cardinality}`,
      );
    }
    this._addWord(word);
  }

  /**
   * Match words in trie either exactly or using wildcards.
   * @param  {string} pattern - search string, using `*` for a wildcard.
   * @return {string[]}
   */
  public match(pattern: string): string[] {
    const {_allWildPattern, _allWords, _cardinality} = this;

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
   * Test if a word exists in the trie, either exactly or using a wildcard. Use '*' for wildcard.
   * @param {string} pattern
   * @returns {boolean}
   */
  public test(pattern: string): boolean {
    if (!pattern || pattern.length !== this._cardinality) {
      return false;
    }

    if (pattern === this._allWildPattern) {
      return this._allWords.size > 0;
    }

    return this._testPattern(pattern);
  }

  /**
   * Get the class identifier for this instance.
   * @returns {string}
   */
  public getType(): string {
    // TODO(jnu) find a cleaner way to get static property from instance's constructor.
    return (this.constructor as typeof AbstractFixedLengthWordIndex).type;
  }

  /**
   * Serialize the index as a simple JSON object. See also .fromJSON.
   * @returns {Object}
   */
  public toJSON(): Object {
    throw new Error('not implemented');
  }

  /**
   * Implementation of #add. Overwrite in subclass.
   * @param {string} word
   * @private
   */
  protected abstract _addWord(word: string): void;

  /**
   * Implementation of #match. Overwrite in subclass.
   * @param {string} pattern
   * @returns {string[]}
   * @private
   */
  protected abstract _matchWords(pattern: string): string[];

  /**
   * Implementation of #test. Overwrite in subclass.
   * @param {string} pattern
   * @returns {boolean}
   * @private
   */
  protected abstract _testPattern(pattern: string): boolean;
}
