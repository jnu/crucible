import React from 'react';
import { GridContent } from './GridContent';
import { GridControls } from './GridControls';
import { AcrossClues } from './AcrossClues';
import { DownClues } from './DownClues';
import './Grid.scss';


export const Grid = ({ grid, onResize, onFocusCell }) => (
    <div className="Grid">
        <GridControls width={grid.get('width')}
                      height={grid.get('height')}
                      onResize={onResize}>
        </GridControls>
        <AcrossClues clues={grid.get('clues')}></AcrossClues>
        <DownClues clues={grid.get('clues')}></DownClues>
        <div className="Grid_GridContent-container">
            <GridContent content={grid.get('content')}
                         onFocusCell={onFocusCell}
                         selectedCell={grid.get('selectedCell')}
                         menuCell={grid.get('menuCell')}
                         cellSize={grid.get('cellSize')}>
            </GridContent>
        </div>
    </div>
);
