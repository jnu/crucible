import React from 'react';
import {isDefined} from '../lib/isDefined';
import {useSelector} from '../store';
import type {State} from '../store';
import type {GridState, GridCell, GridClue} from '../reducers/grid';

import './PuzzleStats.scss';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const gradeClueCount = (c: number) => {
  return c >= 72 ? '-warn' : c >= 78 ? '-error' : '-ok';
};

/**
 * Render histogram of letter counts, cell counts, and word sums.
 */
export const PuzzleCounts = () => {
  const {clues, content} = useSelector(({grid}) => grid);

  let total = 0;
  let blocks = 0;

  const counts = content.reduce((stats, cell) => {
    const type = cell.type;
    if (type !== 'CONTENT') {
      blocks++;
      return stats;
    }
    total++;
    const letter = cell.value;
    if (!letter) {
      return stats;
    }
    const currentStat = stats[letter];
    stats[letter] = (currentStat || 0) + 1;
    return stats;
  }, {} as {[k: string]: number});

  const clueCount = clues.reduce((n, clue) => {
    return n + Number(isDefined(clue.across)) + Number(isDefined(clue.down));
  }, 0);

  return (
    <div className="PuzzleCounts">
      <ol className="PuzzleCounts_List">
        {ALPHABET.map((letter) => (
          <li className="PuzzleCounts_Item" key={letter}>
            <span className="PuzzleCounts_Item_letter">{letter}</span>
            <span className="PuzzleCounts_Item_count">
              {counts[letter] || '-'}
            </span>
          </li>
        ))}
        <hr />
        <li className="PuzzleCounts_Item" key="cntTotal">
          <span className="PuzzleCounts_Item_letter">&#x25A1;</span>
          <span className="PuzzleCounts_Item_count">{total}</span>
        </li>
        <li className="PuzzleCounts_Item" key="cntBlocks">
          <span className="PuzzleCounts_Item_letter">&#x25A0;</span>
          <span className="PuzzleCounts_Item_count">{blocks}</span>
        </li>
        <li className="PuzzleCounts_Item" key="cntWords">
          <span className="PuzzleCounts_Item_letter">Σ</span>
          <span
            className={`PuzzleCounts_Item_count ${gradeClueCount(clueCount)}`}>
            {clueCount}
          </span>
        </li>
      </ol>
    </div>
  );
};

/**
 * Wrapper for the puzzle stat information.
 */
export const PuzzleStats = () => {
  return (
    <div className="PuzzleStats">
      <PuzzleCounts />
    </div>
  );
};
