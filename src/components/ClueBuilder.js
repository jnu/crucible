import React from 'react';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import { bindAll } from 'lodash';
import { updateClue } from '../actions';


class ClueBuilderView extends React.Component {

    constructor(props) {
        super(props);
        bindAll(this, 'updateClueState');
    }

    updateClueState(e) {
        const value = e.target.value;

        const {
            dispatch,
            hasClue,
            index,
            direction
        } = this.props;

        if (!hasClue) {
            return;
        }

        dispatch(updateClue(direction, index, value));
    }

    render() {
        const {
            index,
            direction,
            value,
            hasClue,
            style
        } = this.props;

        const dirAbbr = (direction || '').substr(0, 1).toUpperCase();
        const label = `${index + 1}-${dirAbbr}`;

        return (
            <div className="ClueBuilder"
                 style={style} >
                { !hasClue ? null :
                    <div>
                        <span className="ClueBuilder_Label"
                              style={{ paddingRight: 12 }}>
                              {label}
                        </span>
                        <TextField name="ClueBuiler_Input"
                                   value={value}
                                   hintText="Enter clue"
                                   onChange={this.updateClueState} />
                    </div>
                }
            </div>
        );
    }

}


const mapStateToProps = state => {
    const { grid } = state;
    const cursor = grid.get('cursor');
    const direction = (grid.get('cursorDirection') || '').toLowerCase();
    const cell = grid.get('content').get(cursor);
    const index = cell ? cell.get(`${direction}Word`) : -1;
    const clue = grid.get('clues').get(index);
    const hasClue = !!(cell && clue && clue.has(direction));
    const value = hasClue ? clue.get(direction) : null;

    return {
        hasClue,
        index,
        direction,
        value
    };
};

export const ClueBuilder = connect(mapStateToProps)(ClueBuilderView);
