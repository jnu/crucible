import React from 'react';
import { connect } from 'react-redux';
import { pure } from 'recompose';
import {
    Direction,
    focusCell,
    setDirection
} from '../actions';
import type { GridCell } from '../lib/crux';
import type { GridClue } from '../reducers/grid';
import type { State, Dispatch } from '../store';
import './Clues.scss';


const CLUE_HEADER_HEIGHT = 42;

const getClueClassName = (i: number, selection: number | void | null, isPrimary: boolean) => {
    const cn = ["Clues_Clue"];
    if (i === selection) {
        cn.push("Clues_Clue-selected");

        if (isPrimary) {
            cn.push("Clues_Clue-selected-primary");
        }
    }
    return cn.join(' ');
};

type CluesViewProps = Readonly<{
  height: number;
  title: string;
  dispatch: Dispatch;
  type: Direction;
  cursorDirection: Direction;
  leftOffset: number;
  topOffset: number;
  cursor: number | null;
  clues: GridClue[];
  content: GridCell[];
}>;

class CluesView extends React.Component<CluesViewProps> {

    onClickClue(clue: GridClue, type: Direction) {
        const { dispatch } = this.props;
        const field = type.toLowerCase() === 'across' ? 'acrossStartIdx' : 'downStartIdx';
        const cell = clue[field];
        if (cell !== null) {
          dispatch(focusCell(cell));
        }
        dispatch(setDirection(type));
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
        const cell = cursor !== null ? content[cursor] : null;
        const selectionField = type === Direction.Across ? 'acrossWord' : 'downWord';
        const selection = cell && cell[selectionField];
        const clueField = type === Direction.Across ? 'across' : 'down';

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
                    {clues.map((clue, i) => clue[clueField] === null ? null :
                        <li key={`${type}-${i}`}
                            className={getClueClassName(i, selection, isPrimarySelection)}
                            onClick={() => this.onClickClue(clue, type)}>
                            <span className="Clues_Clue_idx">{i + 1}</span>
                            <span className="Clues_Clue_text">{clue[clueField]}</span>
                        </li>
                    )}
                </ol>
            </div>
        );
    }
}


const mapStateToProps = (state: State) => {
    const { grid } = state;
    return {
        clues: grid.clues,
        content: grid.content,
        cursor: grid.cursor,
        cursorDirection: grid.cursorDirection,
    };
};


export const Clues = connect(mapStateToProps)(pure(CluesView));
