import React from 'react';


const getCellClassName = (cell, focused) => {
    const annotation = cell.get('annotation');
    const cns = ['GridCell', `GridCell-type-${cell.get('type').toLowerCase()}`];
    if (annotation) {
        cns.push(`GridCell-annotation-${annotation}`);
    }
    if (focused) {
        cns.push('GridCell-focused');
    }
    return cns.join(' ');
}


export const GridCell = ({ cell, focused, onFocus }) => (
    <div className={ getCellClassName(cell, focused) }>
        {cell.get('startOfWord') ?
            <span className="GridCell_clueIdx">{cell.get('clueIdx') + 1}</span> : null
        }
        <input type="text"
               className="GridCell_value"
               onFocus={onFocus}
               onClick={onFocus}
               value={cell.value}
               maxLength={1} />
    </div>
);
