import React from 'react';
import { pure } from 'recompose';
import { GridCell } from './GridCell';
import { CellContextMenu } from './CellContextMenu';
import './GridContent.scss';


const isSelectedCell = (selectedCell, row, col) => {
    if (!selectedCell) {
        return false;
    }
    return selectedCell.get('row') === row && selectedCell.get('col') === col;
};

const getContentWidthHeight = (content, size) => ({
    width: content.has(0) ? content.get(0).size * size : 0,
    height: content.size * size
});


const GridContentView = ({
        content,
        selectedCell,
        menuCell,
        cellSize,
        onFocusCell,
        onUpdateCell,
        onLoseCellContext,
        onRequestCellContext
    }) => (
    <div className="GridContent" style={getContentWidthHeight(content, cellSize)}>
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
                                  onChange={value => onUpdateCell(i, j, { value })}
                                  onFocus={() => onFocusCell(i, j)}
                                  onLoseContext={onLoseCellContext}
                                  onRequestContext={() => onRequestCellContext(i, j)}
                                  focused={isSelectedCell(selectedCell, i, j)}>
                        </GridCell>
                    </div>
                )}
            </div>
        )}
        <CellContextMenu target={menuCell}
                         cellSize={cellSize}
                         content={content}
                         onClose={onLoseCellContext} />
    </div>
);

export const GridContent = pure(GridContentView);
