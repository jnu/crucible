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

const showContextMenu = (e, onRequestContext, onLoseContext) => {
    e.preventDefault();

    const globalClickHandler = () => {
        onLoseContext();
        document.removeEventListener('click', globalClickHandler);
    };
    document.addEventListener('click', globalClickHandler);
    onRequestContext();
}


export const GridCell = ({ cell, focused, onFocus, onChange, onLoseContext, onRequestContext }) => (
    <div className={ getCellClassName(cell, focused) }
         onClick={onFocus}
         onContextMenu={e => showContextMenu(e, onRequestContext, onLoseContext)}>
        {!cell.get('startOfWord') ? null :
            <span className="GridCell_clueIdx">{cell.get('clueIdx') + 1}</span>
        }
        {cell.get('type') === 'BLOCK' ? null :
            <input type="text"
                   className="GridCell_value"
                   onFocus={onFocus}
                   onChange={e => onChange(e.target.value)}
                   value={cell.value}
                   maxLength={1} />
        }
    </div>
);
