import { connect } from 'react-redux';
import { Grid } from './Grid';
import { resize, focusCell } from '../actions';


const mapStateToProps = state => {
    return {
        grid: state.grid
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onResize: (width, height) => dispatch(resize(width, height)),
        onFocusCell: (row, col) => dispatch(focusCell(row, col))
    };
}

export const GridContainer = connect(mapStateToProps, mapDispatchToProps)(Grid);
