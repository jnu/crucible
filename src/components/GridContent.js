import React from 'react';
import { GridCell } from './GridCell';
import './GridContent.scss';


const isSelectedCell = (selectedCell, row, col) => {
    if (!selectedCell) {
        return false;
    }
    return selectedCell.get('row') === row && selectedCell.get('col') === col;
};


export const GridContent = ({ content, selectedCell, menuCell, cellSize, onFocusCell }) => (
    <div className="GridContent">
        {content.map((row, i) =>
            <div className="GridRow" key={i}>
                {row.map((cell, j) =>
                    <div key={`${i},${j}`} style={{
                        position: 'absolute',
                        left: j * cellSize,
                        top: i * cellSize,
                        width: cellSize,
                        height: cellSize
                    }}>
                        <GridCell cell={cell}
                                  onFocus={() => onFocusCell(i, j)}
                                  focused={isSelectedCell(selectedCell, i, j)}>
                        </GridCell>
                    </div>
                )}
            </div>
        )}
    </div>
);
