import React from 'react';
import { pure } from 'recompose';
import { connect } from 'react-redux';
import './PuzzleStats.scss';


const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');


const PuzzleLetterCounts = pure(({ content }) => {
    const counts = content.reduce((stats, cell) => {
        const type = cell.get('type');
        if (type !== 'CONTENT') {
            return stats;
        }
        const letter = cell.get('value');
        if (!letter) {
            return stats;
        }
        const currentStat = stats[letter];
        stats[letter] = (currentStat || 0) + 1;
        return stats;
    }, {});
    return (
        <div className="PuzzleLetterCounts">
            <ol className="PuzzleLetterCounts_List">
                {ALPHABET.map(letter =>
                    <li className="PuzzleLetterCounts_Item" key={letter}>
                        <span className="PuzzleLetterCounts_Item_letter">{letter}</span>
                        <span className="PuzzleLetterCounts_Item_count">{counts[letter] || '-'}</span>
                    </li>
                )}
            </ol>
        </div>
    );
});



const PuzzleStatsView = pure(({ grid, dispatch }) => {
    return (
        <div className="PuzzleStats">
            <PuzzleLetterCounts content={grid.get('content')} />
        </div>
    );
});

export const PuzzleStats = connect(state => ({ grid: state.grid }))(PuzzleStatsView);
