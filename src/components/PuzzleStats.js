import React from 'react';
import { pure } from 'recompose';
import { connect } from 'react-redux';
import './PuzzleStats.scss';
import { isDefined } from '../lib/isDefined';


const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');


const PuzzleCounts = pure(({ content, clues }) => {
    let total = 0;
    let blocks = 0;

    const counts = content.reduce((stats, cell) => {
        const type = cell.get('type');
        if (type !== 'CONTENT') {
            blocks++;
            return stats;
        }
        total++;
        const letter = cell.get('value');
        if (!letter) {
            return stats;
        }
        const currentStat = stats[letter];
        stats[letter] = (currentStat || 0) + 1;
        return stats;
    }, {});

    const clueCount = clues.reduce((n, clue) => {
        return n + isDefined(clue.get('across')) + isDefined(clue.get('down'));
    }, 0);

    return (
        <div className="PuzzleCounts">
            <ol className="PuzzleCounts_List">
                {ALPHABET.map(letter =>
                    <li className="PuzzleCounts_Item" key={letter}>
                        <span className="PuzzleCounts_Item_letter">{letter}</span>
                        <span className="PuzzleCounts_Item_count">{counts[letter] || '-'}</span>
                    </li>
                )}
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


const PuzzleStatsView = pure(({ grid, onResize }) => {
    return (
        <div className="PuzzleStats">
            <PuzzleCounts content={grid.get('content')} clues={grid.get('clues')} />
        </div>
    );
});


const mapStateToProps = ({ grid }) => ({ grid });

export const PuzzleStats = connect(mapStateToProps)(PuzzleStatsView);
