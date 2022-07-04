import React from 'react';
import {pure} from 'recompose';
import {connect} from 'react-redux';
import './PuzzleStats.scss';
import {isDefined} from '../lib/isDefined';
import type {GridCell, Clue} from '../lib/crux';
import type {State} from '../store';
import type {GridState} from '../reducers/grid';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

type PuzzleCountsProps = Readonly<{
  content: GridCell[];
  clues: Clue[];
}>;

const PuzzleCounts = pure(({content, clues}: PuzzleCountsProps) => {
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
          <span className="PuzzleCounts_Item_count">{clueCount}</span>
        </li>
      </ol>
    </div>
  );
});

type PuzzleStatsViewProps = Readonly<{
  grid: GridState;
}>;

const PuzzleStatsView = pure(({grid}: PuzzleStatsViewProps) => {
  return (
    <div className="PuzzleStats">
      <PuzzleCounts content={grid.content} clues={grid.clues} />
    </div>
  );
});

const mapStateToProps = ({grid}: State) => ({grid});

export const PuzzleStats = connect(mapStateToProps)(PuzzleStatsView);
