import React from 'react';
import { pure } from 'recompose';
import { connect } from 'react-redux';
import './PuzzleStats.scss';
import { resize } from '../actions';


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
            <PuzzleLetterCounts content={grid.get('content')} />
            <PuzzleSize width={grid.get('width')} height={grid.get('height')} onChange={onResize} />
        </div>
    );
});


const mapStateToProps = ({ grid }) => ({ grid });
const mapDispatchToProps = dispatch => ({
    onResize: (width, height) => dispatch(resize(width, height))
});

export const PuzzleStats = connect(mapStateToProps, mapDispatchToProps)(PuzzleStatsView);
