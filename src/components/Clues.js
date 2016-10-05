import React from 'react';
import { pure } from 'recompose';
import TextField from 'material-ui/TextField';
import './Clues.scss';


const CluesView = ({ clues, content, title, type, onChange }) => (
    <div className={ `Clues Clues-${type.toLowerCase()}` }>
        <h1 className="Clues_header">{ title }</h1>
        <div className="Clues_spacer" />
        <ol className="Clues_list">
            {clues.map((clue, i) => clue.get(type) === null ? null :
                <li key={`${type}-${i}`} className="Clues_Clue">
                    <span className="Clues_Clue_idx">{i + 1}.</span>
                    <div className="Clues_Clue_text">{clue.get(type) || 'Write clue'}</div>
                </li>
            )}
        </ol>
    </div>
);

export const Clues = pure(CluesView);
