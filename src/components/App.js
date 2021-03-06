import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { muiCrucibleTheme } from './muiCrucibleTheme';
import { Layout } from './Layout';
import { Header } from './Header';
import './App.scss';


export const App = () => (
    <MuiThemeProvider muiTheme={getMuiTheme(muiCrucibleTheme)}>
        <div className="AppWidth-">
            <Header />
            <div className="Puzzle">
                <Layout />
            </div>
        </div>
    </MuiThemeProvider>
);
