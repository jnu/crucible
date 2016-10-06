import { combineReducers } from 'redux';
import { grid } from './grid';
import { screen } from './screen';
import { meta } from './meta';


export const crucibleApp = combineReducers({
    grid,
    screen,
    meta
});
