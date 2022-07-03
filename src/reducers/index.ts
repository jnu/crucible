import { Reducer, combineReducers } from 'redux';
import { grid } from './grid';
import { screen } from './screen';
import { meta } from './meta';
import { wordlist } from './wordlist';

export type CombinedState = {
  grid: ReturnType<typeof grid>;
  screen: ReturnType<typeof screen>;
  meta: ReturnType<typeof meta>;
  wordlist: ReturnType<typeof wordlist>;
};

export const crucibleApp = combineReducers({
    grid,
    screen,
    meta,
    wordlist
}) as Reducer<CombinedState>;
