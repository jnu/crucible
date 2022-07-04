import React from 'react';
import {Provider} from 'react-redux';

import type {Store} from '../store';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import {muiCrucibleTheme} from './muiCrucibleTheme';
import {Layout} from './Layout';
import {Header} from './Header';
import './App.scss';

/**
 * Properties required to render the root app.
 */
export type AppProps = {
  store: Store;
};

/**
 * Root component to render Crucible app.
 */
export const App = ({store}: AppProps) => (
  <Provider store={store}>
    <ThemeProvider theme={createTheme(muiCrucibleTheme)}>
      <div className="AppWidth-">
        <Header />
        <div className="Puzzle">
          <Layout />
        </div>
      </div>
    </ThemeProvider>
  </Provider>
);
