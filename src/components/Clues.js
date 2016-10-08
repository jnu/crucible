import React from 'react';
import { pure } from 'recompose';
import TextField from 'material-ui/TextField';
import './Clues.scss';


const CLUE_HEADER_HEIGHT = 42;

const getClueClassName = (i, selection, isPrimary) => {
    const cn = ["Clues_Clue"];
    if (i === selection) {
        cn.push(["Clues_Clue-selected"]);

        if (isPrimary) {
            cn.push(["Clues_Clue-selected-primary"]);
        }
    }
    return cn.join(' ');
}


const CluesView = ({
    clues,
    content,
    height,
    title,
    type,
    leftOffset,
    topOffset,
    onChange,
    isPrimarySelection,
    selection
}) => (
    <div className={ `Clues Clues-${type.toLowerCase()}` } style={{
            height,
            top: topOffset,
            left: leftOffset,
            position: 'absolute'
        }}>
        <div className="Clues_header-container"
             style={{ height: CLUE_HEADER_HEIGHT }}>
            <span className="Clues_header">{ title }</span>
            <div className="Clues_spacer" />
        </div>
        <ol className="Clues_list" style={{ height: height - CLUE_HEADER_HEIGHT }}>
            {clues.map((clue, i) => clue.get(type) === null ? null :
                <li key={`${type}-${i}`} className={getClueClassName(i, selection, isPrimarySelection)}>
                    <span className="Clues_Clue_idx">{i + 1}.</span>
                    <span className="Clues_Clue_text">{clue.get(type)}</span>
                </li>
            )}
        </ol>
    </div>
);

export const Clues = pure(CluesView);
