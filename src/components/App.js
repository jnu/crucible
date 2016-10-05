import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { muiCrucibleTheme } from './muiCrucibleTheme';
import { GridContainer } from './GridContainer';
import { Header } from './Header';
import './App.scss';


export const App = () => (
    <MuiThemeProvider muiTheme={getMuiTheme(muiCrucibleTheme)}>
        <div>
            <Header />
            <GridContainer />
        </div>
    </MuiThemeProvider>
);
