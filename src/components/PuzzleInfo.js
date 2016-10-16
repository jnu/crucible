import React from 'react';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import { bindAll } from 'lodash';
import { updatePuzzleInfo } from '../actions';
import './PuzzleInfo.scss';


class PuzzleInfoView extends React.Component {

    constructor(props) {
        super(props);
        bindAll(this, 'updatePuzzleTitle');
    }

    updatePuzzleTitle(e) {
        const value = e.target.value;

        const {
            dispatch,
        } = this.props;

        dispatch(updatePuzzleInfo('title', value));
    }

    render() {
        const {
            style,
            value
        } = this.props;

        return (
            <div className="PuzzleInfo"
                 style={style} >
                <div className="PuzzleInfo_Title">
                    <TextField name="PuzzleInfo_Title_Input"
                               value={value}
                               hintText="Puzzle title"
                               onChange={this.updatePuzzleTitle} />
                </div>
            </div>
        );
    }

}


const mapStateToProps = state => ({
    value: state.grid.get('title')
});

export const PuzzleInfo = connect(mapStateToProps)(PuzzleInfoView);
