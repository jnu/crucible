import {AbstractFixedLengthWordIndex} from './AbstractFixedLengthWordIndex';
import {FixedLengthWordIndex} from './FixedLengthWordIndex';
import {FixedLengthPackedWordIndex} from './FixedLengthPackedWordIndex';
import {LRUCache} from '../LRUCache';

export interface IJSONWordIndex {
  data: any;
  type: string;
}

const _TYPE_TO_IDX_CLS_MAP = {
  [FixedLengthWordIndex.type]: FixedLengthWordIndex,
  [FixedLengthPackedWordIndex.type]: FixedLengthPackedWordIndex,
};

function _typeToIdxCls(type: string) {
  if (_TYPE_TO_IDX_CLS_MAP.hasOwnProperty(type)) {
    return _TYPE_TO_IDX_CLS_MAP[type];
  }
  throw new Error(`Unknown word index type: ${type}`);
}

/**
 * An arbitrary-length word index that supports wildcard matching.
 */
export class WordBank {
  /**
   * Construct a word bank from frozen, encoded DAWGs. In production this should
   * be how WordBanks are instantiated, as constructing banks from raw lists will
   * be too expensive both over the wire and in init time.
   *
   * The input should be a map from word-length to a packed DAWG of words with
   * this length. See Trie#freeze and Trie#encode for expected DAWG format.
   *
   * @public
   * @static
   * @param  {{ [key: number]: String }} dawgs - map from length to packed DAWG
   * @return {WordBank}
   */
  public static fromPacked(dawgs: {[key: number]: string}) {
    const wb = new WordBank();
    wb._fromWordsDAWGs(dawgs);
    return wb;
  }

  public static fromJSON(indexes: IJSONWordIndex[]) {
    const wb = new WordBank();
    wb._indexes = indexes.map((idx) => {
      const Cls = _typeToIdxCls(idx.type);
      return Cls.fromJSON(idx.data);
    });
    return wb;
  }

  // Cache for recent query results
  private _cache: LRUCache<void | string[], string>;

  // Word tries by length
  private _indexes: AbstractFixedLengthWordIndex[];

  constructor(words?: string[] | {[key: number]: string}, cacheSize = 10) {
    this._indexes = [];
    this._cache = new LRUCache(cacheSize);
    if (words) {
      if (Array.isArray(words)) {
        this._fromWordsArray(words as string[]);
      } else {
        this._fromWordsDAWGs(words as {[key: number]: string});
      }
    }
  }

  public toJSON(): IJSONWordIndex[] {
    return this._indexes.map((idx) => ({
      data: idx.toJSON(),
      type: idx.getType(),
    }));
  }

  /**
   * Insert a word or words into the word bank.
   * @param  {String|String[]} word - single word or array of words
   */
  public insert(word: string) {
    this._fromWordsArray(Array.isArray(word) ? word : [word]);
  }

  /**
   * Find all tokens matching input string. Search supports `*` wildcard to
   * match any token.
   * @param  {String} token
   * @return {Promise<String[]>}
   */
  public search(token: string): Promise<string[]> {
    const {_indexes, _cache} = this;

    const cached = _cache.getByKey(token);
    if (cached) {
      return Promise.resolve(cached as string[]);
    }

    const len = token.length;
    const index = _indexes[len];

    // Return immediately if index does not exist.
    if (!index) {
      return Promise.resolve([] as string[]);
    }

    return Promise.resolve(index.match(token)).then((match) => {
      _cache.addByKey(token, match);
      return (match || []) as string[];
    });
  }

  /**
   * Check whether search term exists in the word bank, synchronously.
   * Wildcards are supported using the '*' character.
   * @param {string} query
   * @returns {boolean}
   */
  public testSync(query: string): boolean {
    const {_indexes, _cache} = this;
    const len = query.length;
    const index = _indexes[len];
    if (!index) {
      return false;
    }
    return index.test(query);
  }

  /**
   * Insert the given words into the appropriate indexes.
   * @param  {String[]} words
   * @private
   */
  private _fromWordsArray(words: string[]) {
    const {_indexes} = this;

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
    _indexes.forEach((index) => (index as FixedLengthWordIndex).commit());
  }

  /**
   * Initialize fixed-length indexes from packed DAWGs.
   * @param  {{ [key: number]: String }} dawgs - map from length to DAWG
   * @private
   */
  private _fromWordsDAWGs(dawgs: {[key: number]: string}) {
    const {_indexes} = this;

    const sizes = Object.keys(dawgs);

    for (let i = 0; i < sizes.length; i++) {
      let len = +sizes[i];

      _indexes[len] = new FixedLengthPackedWordIndex(len, dawgs[len]);
    }
  }
}
