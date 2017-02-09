import React from 'react';
import { pure } from 'recompose';
import { connect } from 'react-redux';
import { isDefined } from '../lib/isDefined';
import './WordWizard.scss';



function getCurrentWord(grid, placeholder = '*') {
    const content = grid.get('content');
    const cursor = grid.get('cursor');
    const cursorCell = content.get(cursor);
    if (!isDefined(cursorCell)) {
        return null;
    }

    const cursorDirection = grid.get('cursorDirection');
    const highlightKey = cursorDirection === 'ACROSS' ? 'acrossWord' : 'downWord';
    const highlightWord = cursorCell.get(highlightKey);
    if (!isDefined(highlightWord)) {
        return null;
    }

    // Iterate over grid, building token to search.
    let word = '';
    // TODO could optimize by only searching adjacent cells
    content.forEach(cell => {
        if (cell.get(highlightKey) === highlightWord) {
            word += cell.get('value') || placeholder;
        }
    });
    return word;
}


const WordWizardView = pure(({ grid, wordlist }) => {
    return (
        <div className="WordWizard">
            <p>Lists: { wordlist.get('lists').keySeq().join(', ')}</p>
            <p>Current Word: { getCurrentWord(grid) }</p>
        </div>
    );
});


const mapStateToProps = ({ grid, wordlist }) => ({ grid, wordlist });
const mapDispatchToProps = dispatch => ({});

export const WordWizard = connect(mapStateToProps, mapDispatchToProps)(WordWizardView);
