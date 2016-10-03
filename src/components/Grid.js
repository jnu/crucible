import React from 'react';
import { GridContent } from './GridContent';
import { GridControls } from './GridControls';
import { Clues } from './Clues';
import './Grid.scss';


export const Grid = ({
        grid,
        onResize,
        onFocusCell,
        onUpdateCell,
        onLoseCellContext,
        onRequestCellContext
    }) => (
    <div className="Grid">
        <GridControls width={grid.get('width')}
                      height={grid.get('height')}
                      onResize={onResize} />
        <div className="Grid_HorizontalContainer" style={{ height: 50 + grid.get('cellSize') * grid.get('height') }}>
            <Clues type="across"
                   title="Across"
                   clues={grid.get('clues')}
                   content={grid.get('content')} />
            <div className="Grid_GridContent-container">
                <GridContent content={grid.get('content')}
                             onFocusCell={onFocusCell}
                             onUpdateCell={onUpdateCell}
                             onLoseCellContext={onLoseCellContext}
                             onRequestCellContext={onRequestCellContext}
                             selectedCell={grid.get('selectedCell')}
                             menuCell={grid.get('menuCell')}
                             cellSize={grid.get('cellSize')} />
            </div>
        </div>
        <div className="Grid_HorizontalContainer">
            <Clues type="down"
                   title="Down"
                   clues={grid.get('clues')}
                   content={grid.get('content')} />
        </div>
    </div>
);
