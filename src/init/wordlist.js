import * as wl_nyt16Year from 'data/dist/nyt16Year';
import {
    loadWordList
} from '../actions';


export function init(store) {
    store.dispatch(loadWordList(wl_nyt16Year.id));
}
