import React from 'react';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import { bindAll } from 'lodash';
import { updatePuzzleInfo } from '../actions';
import type { State, Dispatch } from '../store';

import './PuzzleInfo.scss';


type PuzzleInfoViewProps = {
  style: React.CSSProperties;
  value: string;
  dispatch: Dispatch;
};

class PuzzleInfoView extends React.Component<PuzzleInfoViewProps> {

    constructor(props: PuzzleInfoViewProps) {
        super(props);
        bindAll(this, 'updatePuzzleTitle');
    }

    updatePuzzleTitle(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        const value = (e.target as HTMLTextAreaElement).value;

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


const mapStateToProps = (state: State) => ({
    value: state.grid.title,
});

export const PuzzleInfo = connect(mapStateToProps)(PuzzleInfoView);
