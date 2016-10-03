import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { GridContainer } from './GridContainer';
import './App.scss';


export const App = () => (
    <MuiThemeProvider>
        <GridContainer />
    </MuiThemeProvider>
);
