import { connect } from 'react-redux';
import { Grid } from './Grid';
import {
    resize,
    focusCell,
    updateCell,
    hideCellContext,
    requestCellContext
} from '../actions';


const mapStateToProps = state => {
    return {
        grid: state.grid
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onResize: (width, height) => dispatch(resize(width, height)),
        onFocusCell: (row, col) => dispatch(focusCell(row, col)),
        onUpdateCell: (row, col, updates) => dispatch(updateCell(row, col, updates)),
        onLoseCellContext: () => dispatch(hideCellContext()),
        onRequestCellContext: (row, col) => dispatch(requestCellContext(row, col))
    };
}

export const GridContainer = connect(mapStateToProps, mapDispatchToProps)(Grid);
