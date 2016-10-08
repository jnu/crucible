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
        const { index, direction, value, hasClue } = this.props;
        if (!hasClue) {
            return null;
        }
        return (
            <div className="ClueBuilder">
                <span>{index + 1}{(direction || '').substr(0, 1)}.</span>
                <TextField name="ClueBuiler_Input"
                           value={value}
                           onChange={this.updateClueState} />
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
    const value = (cell && clue) ? clue.get(direction) : '';

    return {
        hasClue: !!cell,
        index,
        direction,
        value
    };
}

export const ClueBuilder = connect(mapStateToProps)(ClueBuilderView);
