import React from 'react';
import {pure} from 'recompose';
import {connect} from 'react-redux';
import {List} from 'react-virtualized';
import {isDefined} from '../lib/isDefined';
import type {GridState, GridCell} from '../reducers/grid';
import type {WordBank} from '../lib/readcross/WordBank';
import type {WordlistState, Wordlist} from '../reducers/wordlist';
import {autoFillGrid} from '../actions/gridSemantic';
import {Direction} from '../actions/gridMeta';
import {State, Dispatch} from '../store';
import './WordWizard.scss';

/**
 * Search for a given word.
 */
type WordQuery = Readonly<{
  word: string | null;
  crosses: Crossing[];
}>;

/**
 * Represent a crossed word.
 */
type Crossing = Readonly<{
  at: number;
  crossIdx: number;
  crossing: string;
}>;

/**
 * Extract the word in the given direction from the grid at the given cursor.
 * Optionally extract all crossings with this word. The placeholder is used to
 * denote blank cells.
 */
function pullWordFromContent(
  content: ReadonlyArray<GridCell>,
  width: number,
  cursor: number,
  direction: Direction,
  placeholder: string,
  withCrosses = false,
): Readonly<{
  word: string | null;
  crosses: Crossing[];
  focusIdx: number;
}> {
  const isAcross = direction === Direction.Across;
  const cell = content[cursor];
  if (cell.type === 'BLOCK') {
    return {word: null, crosses: [], focusIdx: -1};
  }

  const highlightKey = isAcross ? 'acrossWord' : 'downWord';
  const inc = isAcross ? 1 : width;
  const highlightWord = cell[highlightKey];
  // Initialize with given cell
  let curWord = cell.value || placeholder;
  let crosses = [];
  let curFocusIdx = 0;
  // Recursively pull initial crossing if requested. Note recursion depth is
  // only ever one. Despite recursion we only ever scan at worst N+M cells,
  // where N is the total number of cells in the grid, and M is the length of
  // the initial target word. In most cases (i.e., grids with blocks) total
  // blocks scanned will be fewer than N.
  if (withCrosses) {
    const {word, focusIdx} = pullWordFromContent(
      content,
      width,
      cursor,
      isAcross ? Direction.Down : Direction.Across,
      placeholder,
      false,
    );
    crosses.push({
      at: cursor,
      crossIdx: focusIdx,
      crossing: word || '',
    });
  }

  // Scan all cells after current cell (to the right or down), then all the
  // cells before current one.
  for (let delta of [inc, -inc]) {
    let ptr = cursor;
    while (true) {
      ptr += delta;
      // Check bounds, especially less than zero, because Immutable
      // supports negative indexing.
      if (ptr < 0 || ptr >= content.length) {
        break;
      }
      let nextCell = content[ptr];
      if (nextCell && nextCell[highlightKey] === highlightWord) {
        let value = nextCell.value || placeholder;
        let crossData;
        if (withCrosses) {
          let {word, focusIdx} = pullWordFromContent(
            content,
            width,
            ptr,
            isAcross ? Direction.Down : Direction.Across,
            placeholder,
            false,
          );
          crossData = {crossing: word || '', at: ptr, crossIdx: focusIdx};
        }
        // Postpend or prepend value depending on search direction.
        if (delta > 0) {
          curWord += value;
          if (crossData) {
            crosses.push(crossData);
          }
        } else {
          curFocusIdx += 1;
          curWord = value + curWord;
          if (crossData) {
            crosses.unshift(crossData);
          }
        }
      } else {
        break;
      }
    }
  }

  return {crosses, word: curWord, focusIdx: curFocusIdx};
}

/**
 * Extract the current word from the grid, as well as all of the words that
 * cross this one. Use placeholder in lieu of missing values.
 */
function getCurrentWord(grid: GridState, placeholder = '*') {
  const content = grid.content;
  const cursor = grid.cursor;
  if (cursor === null) {
    return null;
  }

  const cursorCell = content[cursor];
  if (!isDefined(cursorCell)) {
    return null;
  }

  const cursorDirection = grid.cursorDirection;

  let {word, crosses} = pullWordFromContent(
    content,
    grid.width,
    cursor,
    cursorDirection,
    placeholder,
    true,
  );

  return {word, crosses};
}

/**
 * Represent a search result. Score is the strength of match, the match is
 * the matched word, and the hits indicate valid or invalid char positions.
 */
type WordMatch = Readonly<{
  score: number;
  match: string;
  hits: boolean[];
}>;

/**
 * Search all word lists for the given query. The query consists of a word and
 * all the crossings of this word.
 */
function searchWordLists(lists: Wordlist, query: WordQuery) {
  if (!query.word) {
    return Promise.resolve([]);
  }

  // TODO One-level-deep crossing queries are sort of helpful, but a little
  // confusing to work with. Do we have to validate multiple levels?
  const allLists = Object.values(lists);
  const searchAll = (word: string) =>
    !word
      ? Promise.resolve([])
      : Promise.all(allLists.map((list) => list.search(word)))
          // TODO may want to include source metadata. For now, just glom all
          // results together no matter which list they came from.
          .then((words) => words.reduce((agg, list) => agg.concat(list), []));
  const {word, crosses} = query;
  // Fetch all sets of all possible words at crossings
  const crossesPromise = Promise.all(
    crosses.map(({crossing}) => searchAll(crossing)),
  )
    // Create a Set of acceptable chars for each crossing
    .then((crossMatches) => {
      return crossMatches.map((matches, i) => {
        const {crossIdx} = crosses[i];
        return matches.reduce(
          (chars, match) => chars.add(match[crossIdx]),
          new Set(),
        );
      });
    });
  // Fetch possible words for highlighted query, then partition into words
  // that are validated at all crossings and words that are not.
  // TODO could rank by # of chars matched (and highlight in UI).
  return Promise.all([searchAll(word), crossesPromise])
    .then(([naiveMatches, charsAtCrossings]) => {
      return naiveMatches.map((match) => {
        let score = 0;
        const hits = charsAtCrossings.map((chars, i) => {
          const has = chars.has(match[i]);
          score += has ? 1 : 0;
          return has;
        });
        return {
          match,
          score,
          hits,
        };
      });
    })
    .then((matchMap) => {
      // Sort results by match score, then alphabetically.
      return matchMap.sort((a, b) => {
        return a.score > b.score
          ? -1
          : a.score === b.score
          ? a.match < b.match
            ? -1
            : 1
          : 1;
      });
    });
}

/**
 * Serialize crossing array for semantic comparison
 * @param  {Crossing[]} crosses
 * @return {String}
 */
function serializeCrosses(crosses: Crossing[]) {
  return crosses.map((c) => c.crossing).join(',');
}

const INITIAL_WIZARD_STATE = {
  query: null,
  matches: [],
  fetching: false,
  error: null,
};

const wordWizardStyle = {
  height: '100%',
};

type WordWizardViewState = Readonly<{
  query: WordQuery | null;
  matches: WordMatch[];
  fetching: boolean;
  error: Error | null;
}>;

type WordWizardViewProps = Readonly<{
  grid: GridState;
  wordlist: WordlistState;
  dispatch: Dispatch;
}>;

class WordWizardView extends React.Component<
  WordWizardViewProps,
  WordWizardViewState
> {
  constructor(props: WordWizardViewProps) {
    super(props);
    this.state = INITIAL_WIZARD_STATE;
    this._renderListRow = this._renderListRow.bind(this);
    this._autoFillGrid = this._autoFillGrid.bind(this);
  }

  /**
   * Check if potential matches in state might have changed. Assume that
   * potential matches are deterministic given wordlist state and nextQuery.
   */
  _areMatchesCurrent(wordlist: WordlistState, nextQuery: WordQuery) {
    return (
      this.state.query &&
      nextQuery &&
      this.state.query.word === nextQuery.word &&
      this.props.wordlist === wordlist &&
      serializeCrosses(this.state.query.crosses) ===
        serializeCrosses(nextQuery.crosses)
    );
  }

  componentWillReceiveProps(nextProps: WordWizardViewProps) {
    const nextQuery = getCurrentWord(nextProps.grid);
    // No current word means no query; reset to initial state.
    if (!nextQuery || !nextQuery.word) {
      this.setState(INITIAL_WIZARD_STATE);
      return;
    }
    // If potential matches might've changed, need to recomputed.
    if (!this._areMatchesCurrent(nextProps.wordlist, nextQuery)) {
      const searchPromise = searchWordLists(
        nextProps.wordlist.lists,
        nextQuery,
      );
      // Set "now searching" state
      this.setState({
        query: nextQuery,
        matches: [],
        fetching: true,
        error: null,
      });
      // Update state when promise returns.
      searchPromise
        .then((matches) => {
          // Only update if state is current, otherwise drop.
          if (this._areMatchesCurrent(nextProps.wordlist, nextQuery)) {
            this.setState({
              matches,
              fetching: false,
              error: null,
            });
          }
        })
        .catch((error) => {
          // Only update if state is current, otherwise drop.
          if (this._areMatchesCurrent(nextProps.wordlist, nextQuery)) {
            this.setState({
              matches: [],
              fetching: false,
              error,
            });
          }
        });
    }
  }

  _renderListRow({
    key,
    index,
    style,
  }: {
    key: string;
    index: number;
    style: React.CSSProperties;
  }) {
    const {match, hits} = this.state.matches[index];
    return (
      <div key={key} style={style}>
        {hits.map((hit, i) => (
          <span key={`key-${i}`} className={hit ? 'match-hit' : 'match-miss'}>
            {match[i]}
          </span>
        ))}
      </div>
    );
  }

  _autoFillGrid() {
    this.props.dispatch(autoFillGrid(this.props.wordlist));
  }

  render() {
    const {query, fetching, matches, error} = this.state;
    const matchesUi =
      query === null ? (
        <div>{/* TODO: placeholder? */}</div>
      ) : fetching ? (
        <div>Finding words ...</div>
      ) : error ? (
        <div>Error fetching words: {error}</div>
      ) : (
        <div>
          <List
            width={300}
            height={90}
            rowCount={matches.length}
            rowHeight={15}
            rowRenderer={this._renderListRow}
          />
        </div>
      );
    return (
      <div className="WordWizard" style={wordWizardStyle}>
        <div>
          <button onClick={this._autoFillGrid}>Auto Fill</button>
        </div>
        <div>{matchesUi}</div>
      </div>
    );
  }
}

const mapStateToProps = ({grid, wordlist}: State) => ({grid, wordlist});

export const WordWizard = connect(mapStateToProps)(pure(WordWizardView));
