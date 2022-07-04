import React from 'react';
import {connect} from 'react-redux';
import TextField from 'material-ui/TextField';
import {bindAll} from 'lodash';
import {Direction, updateClue} from '../actions';
import type {State, Dispatch} from '../store';

type ClueBuilderViewProps = Readonly<{
  dispatch: Dispatch;
  hasClue: boolean;
  index: number;
  direction: Direction;
  value: string;
  style: React.CSSProperties;
}>;

class ClueBuilderView extends React.Component<ClueBuilderViewProps> {
  constructor(props: ClueBuilderViewProps) {
    super(props);
    bindAll(this, 'updateClueState');
  }

  updateClueState(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const value = (e.target as HTMLTextAreaElement).value;

    const {dispatch, hasClue, index, direction} = this.props;

    if (!hasClue) {
      return;
    }

    dispatch(updateClue(direction, index, value));
  }

  render() {
    const {index, direction, value, hasClue, style} = this.props;

    const dirAbbr = (direction || '').substr(0, 1).toUpperCase();
    const label = `${index + 1}-${dirAbbr}`;

    return (
      <div className="ClueBuilder" style={style}>
        {!hasClue ? null : (
          <div>
            <span className="ClueBuilder_Label" style={{paddingRight: 12}}>
              {label}
            </span>
            <TextField
              name="ClueBuiler_Input"
              value={value}
              hintText="Enter clue"
              style={{width: 'calc(100% - 60px)'}}
              onChange={this.updateClueState}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: State) => {
  const {grid} = state;
  const cursor = grid.cursor;
  const cell = grid.content[cursor || -1];
  const field =
    grid.cursorDirection === Direction.Across ? 'acrossWord' : 'downWord';
  const index = cell ? cell[field] : -1;
  const clue = grid.clues[index || -1];
  const clueField =
    grid.cursorDirection === Direction.Across ? 'across' : 'down';
  const hasClue = !!clue;
  const value = hasClue ? clue[clueField] : null;
  console.log('CLUE', hasClue, value, clue, cell);

  return {
    hasClue,
    index,
    direction: grid.cursorDirection,
    value,
  };
};

export const ClueBuilder = connect(mapStateToProps)(ClueBuilderView);
