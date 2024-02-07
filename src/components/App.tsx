import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {
  useNavigate,
  useParams,
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import {ThemeProvider, createTheme} from '@mui/material/styles';

import type {Store} from '../store';
import {useSelector, useDispatch} from '../store';
import {loadPuzzle} from '../actions';
import {muiCrucibleTheme} from './muiCrucibleTheme';
import {Layout} from './Layout';
import {Header} from './Header';
import {Pdf} from './Pdf';
import './App.scss';

/**
 * Properties required to render the root app.
 */
export type AppProps = {
  store: Store;
};

const _Inner = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {puzzleId} = useParams();
  const {currentPuzzleId, loading, display} = useSelector(({grid, wordlist, view}) => ({
    currentPuzzleId: grid.id,
    loading: wordlist.fetching.size > 0,
    display: view.display,
  }));

  // Make sure the puzzle displayed matches anything shown in the URL.
  useEffect(() => {
    if (!currentPuzzleId) {
      return;
    }

    if (!puzzleId) {
      navigate(`/${currentPuzzleId}`, {replace: true});
      return;
    }

    if (puzzleId !== currentPuzzleId) {
      dispatch(loadPuzzle(puzzleId));
    }
  }, [puzzleId, currentPuzzleId]);

  return (
    <div className={`AppWidth- ${loading ? '-loading' : ''}`}>
      {loading ? (
        <>
          <CircularProgress />
          <div className="caption">Loading ...</div>
        </>
      ) : (
        <>
          <Header />
          <div className="Puzzle">
            {display === "pdf" ?
              <Pdf /> : <Layout />}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Root component to render Crucible app.
 */
export const App = ({store}: AppProps) => (
  <Provider store={store}>
    <ThemeProvider theme={createTheme(muiCrucibleTheme)}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<_Inner />}>
            <Route path=":puzzleId" />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
);
