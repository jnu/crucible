import React from 'react';
import { connect } from 'react-redux';
import { pure } from 'recompose';
import TextField from 'material-ui/TextField';
import {
    focusCell,
    setDirection
} from '../actions';
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


class CluesView extends React.Component {

    onClickClue(clue, type) {
        const { dispatch } = this.props;
        dispatch(focusCell(clue.get(`${type}StartIdx`)));
        dispatch(setDirection(type.toUpperCase()));
    }

    render() {
        const {
            height,
            title,
            type,
            cursorDirection,
            leftOffset,
            topOffset,
            content,
            cursor,
            clues
        } = this.props;

        if (!content || !clues) {
            return null;
        }

        const isPrimarySelection = cursorDirection.toLowerCase() === type.toLowerCase();
        const cell = content.get(cursor);
        const selection = cell && cell.get(`${type}Word`);

        return (
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
                        <li key={`${type}-${i}`}
                            className={getClueClassName(i, selection, isPrimarySelection)}
                            onClick={() => this.onClickClue(clue, type)}>
                            <span className="Clues_Clue_idx">{i + 1}</span>
                            <span className="Clues_Clue_text">{clue.get(type)}</span>
                        </li>
                    )}
                </ol>
            </div>
        );
    }
}


const mapStateToProps = state => {
    const { grid } = state;
    return {
        clues: grid.get('clues'),
        content: grid.get('content'),
        cursor: grid.get('cursor'),
        cursorDirection: grid.get('cursorDirection')
    };
}


export const Clues = connect(mapStateToProps)(pure(CluesView));
