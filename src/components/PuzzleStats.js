import React from 'react';
import { pure } from 'recompose';
import { connect } from 'react-redux';
import './PuzzleStats.scss';
import { resize } from '../actions';
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



const PuzzleSize = ({ width, height, onChange }) => (
    <div className="PuzzleStats_Cell PuzzleSize">
        <div className="PuzzleSize_controls">
            <input type="text"
                   value={width}
                   onChange={e => onChange(+e.target.value, height)} />
            <input type="text"
                   value={height}
                   onChange={e => onChange(width, +e.target.value)} />
        </div>
    </div>
);


const PuzzleStatsView = pure(({ grid, onResize }) => {
    return (
        <div className="PuzzleStats">
            <PuzzleCounts content={grid.get('content')} clues={grid.get('clues')} />
            <PuzzleSize width={grid.get('width')} height={grid.get('height')} onChange={onResize} />
        </div>
    );
});


const mapStateToProps = ({ grid }) => ({ grid });
const mapDispatchToProps = dispatch => ({
    onResize: (width, height) => dispatch(resize(width, height))
});

export const PuzzleStats = connect(mapStateToProps, mapDispatchToProps)(PuzzleStatsView);
