import React from 'react';
import TextField from 'material-ui/TextField';
import './Clues.scss';


/**
 * Read the answer from a grid corresponding to a given clue.
 */
const getAnswerForClue = (content, direction, clue) => {
    if (!clue) {
        return '';
    }
    let row = clue.get('row');
    let col = clue.get('col');
    let answer = '';

    if (direction === 'across') {
        const gridRow = content.get(row);
        do {
            const cell = gridRow.get(col++);
            if (!(cell && cell.get('type') === 'CONTENT')) {
                break;
            }
            answer += (cell.get('value') || '_');
        } while (1);
    } else {
        let gridRow = content.get(row);
        do {
            const gridRow = content.get(row++);
            if (!gridRow) {
                break;
            }
            const cell = gridRow.get(col);
            if (cell.get('type') !== 'CONTENT') {
                break;
            }
            answer += (cell.get('value') || '_');
        } while (1);
    }

    return answer;
}

const getHintTextForClue = (content, direction, clue) => {
    const answer = getAnswerForClue(content, direction, clue);
    return /^_+$/.test(answer) ? 'Write answer in grid' : `Clue for: "${answer}"`;
}


export const Clues = ({ clues, content, title, type }) => (
    <div className={ `Clues Clues-${type.toLowerCase()}` }>
        <h1 className="Clues_Title">{ title }</h1>
        <ol>
            {clues.map((clue, i) => clue.get(type) === null ? null :
                <li key={`${type}-${i}`} className="Clues_Clue">
                    <span class="Clues_Clue_idx">{i + 1}.</span>
                    <TextField value={clue.get(type)} hintText={getHintTextForClue(content, type, clue)} />
                </li>
            )}
        </ol>
    </div>
);
