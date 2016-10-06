import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { crucibleApp } from './reducers';
import { App } from './components/App';
import { debounce } from 'lodash';
import { setScreenSize } from './actions';
import * as bmp from './lib/gridShape';
const injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();


const store = createStore(crucibleApp);


// Monitor screen size for advanced layout calculations.
const doResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    store.dispatch(setScreenSize(width, height))
}
window.addEventListener('resize', debounce(doResize, 50));
// Trigger once on init.
doResize();


render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
