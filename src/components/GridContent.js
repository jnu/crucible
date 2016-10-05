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
        width,
        height,
        cellSize,
        menuCell,
        cursor,
        cursorDirection,
        onFocusCell,
        onUpdateCell,
        onLoseCellContext,
        onRequestCellContext
    }) => {
    const cursorCell = cursor !== null && cursor !== undefined && content.get(cursor);
    const highlightKey = cursorDirection === 'ACROSS' ? 'acrossWord' : 'downWord';
    const highlightWord = cursorCell && cursorCell.get(highlightKey);
    const hasHighlight = !!cursorCell && highlightWord !== null && highlightWord !== undefined;
    return (
        <div className="GridContent" style={{ width: width * cellSize, height: height * cellSize }}>
            {content.map((cell, i) => {
                const y = ~~(i / width);
                const x = i % width;
                return (
                    <GridCell cell={cell}
                              key={i}
                              index={i}
                              left={x}
                              top={y}
                              size={cellSize}
                              onChange={onUpdateCell}
                              onFocus={onFocusCell}
                              onLoseContext={onLoseCellContext}
                              onRequestContext={onRequestCellContext}
                              focused={cursor === i}
                              highlight={hasHighlight && highlightWord === cell.get(highlightKey)}>
                    </GridCell>
                );
            })}
            <CellContextMenu />
        </div>
    );
};
export const GridContent = pure(GridContentView);
