import React, {useState, useEffect} from 'react';
import {List} from 'react-virtualized';
import {isDefined} from '../lib/isDefined';
import type {GridState, GridCell} from '../reducers/grid';
import type {WordBank} from '../lib/readcross/WordBank';
import type {WordlistState, Wordlist} from '../reducers/wordlist';
import {Direction} from '../actions/gridMeta';
import {useSelector, useDispatch} from '../store';
import type {State, Dispatch} from '../store';
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
 */
const serializeCrosses = (crosses: Crossing[]) => {
  return crosses.map((c) => c.crossing).join(',');
};

export type WordWizardProps = {
  height: number;
  width: number;
};

/**
 * UI for showing magically relevant words based on the current grid.
 */
export const WordWizard = ({height, width}: WordWizardProps) => {
  const dispatch = useDispatch();
  const {grid, wordlist} = useSelector((x) => x);
  const [query, setQuery] = useState<WordQuery | null>(null);
  const [matches, setMatches] = useState<WordMatch[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Reset state to initial blank state.
  const resetState = () => {
    setQuery(null);
    setMatches([]);
    setFetching(false);
    setError(null);
  };

  useEffect(() => {
    const nextQuery = getCurrentWord(grid);
    // No current word means no query; reset to initial state.
    if (!nextQuery || !nextQuery.word) {
      resetState();
      return;
    }

    // Set "now searching" state
    setFetching(true);
    setMatches([]);
    setQuery(nextQuery);
    setError(null);

    // Update state when promise returns.
    searchWordLists(wordlist.lists, nextQuery)
      .then((foundMatches) => {
        setMatches(foundMatches);
        setError(null);
        setFetching(false);
      })
      .catch((error) => {
        setFetching(false);
        setMatches([]);
        setError(error);
      });
  }, [grid, wordlist]);

  // Render matches in a virtualized list for performance
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
          width={width}
          height={height}
          rowCount={matches.length}
          rowHeight={15}
          rowRenderer={({key, index, style}) => {
            const {match, hits} = matches[index];
            return (
              <div key={key} style={style}>
                {hits.map((hit, i) => (
                  <span
                    key={`key-${i}`}
                    className={hit ? 'match-hit' : 'match-miss'}>
                    {match[i]}
                  </span>
                ))}
              </div>
            );
          }}
        />
      </div>
    );

  return (
    <div className="WordWizard" style={{height: '100%'}}>
      {matchesUi}
    </div>
  );
};
