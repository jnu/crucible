import React, {useState, useEffect} from 'react';
import {List} from 'react-virtualized';
import {isDefined} from '../lib/isDefined';
import type {GridState, GridCell} from '../reducers/grid';
import type {WordQuery, WordMatch} from '../lib/gridiron/types';
import {searchWordLists} from '../lib/gridiron/search';
import {getCurrentWord} from '../lib/gridiron/util';
import type {WordlistState} from '../reducers/wordlist';
import {Direction} from '../lib/crux';
import {useSelector, useDispatch} from '../store';
import type {State, Dispatch} from '../store';
import './WordWizard.scss';

const HEADER_HEIGHT = 50;

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
      <div className="WordWizard_placeholder">
        Suggestions to fill the grid will appear here as you work.
      </div>
    ) : fetching ? (
      <div>Finding words ...</div>
    ) : error ? (
      <div>Error fetching words: {error}</div>
    ) : matches.length === 0 ? (
      <div className="WordWizard_placeholder">
        No words found in the word list.
      </div>
    ) : (
      <div>
        <List
          width={width}
          height={Math.max(height - HEADER_HEIGHT, 0)}
          rowCount={matches.length}
          rowHeight={18}
          rowRenderer={({key, index, style}) => {
            const {match, hits, misses} = matches[index];
            return (
              <div key={key} style={style}>
                {hits.map((hit, i) => (
                  <span
                    key={`key-${i}`}
                    className={
                      hit
                        ? 'match-hit'
                        : misses[i]
                        ? 'match-miss'
                        : 'match-neutral'
                    }>
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
    <div className="WordWizard" style={{height: '100%', width}}>
      <div
        style={{height: HEADER_HEIGHT}}
        className="WordWizard_header-container">
        <span className="WordWizard_header">Word List</span>
        <div className="WordWizard_spacer" />
      </div>
      <div>{matchesUi}</div>
    </div>
  );
};
