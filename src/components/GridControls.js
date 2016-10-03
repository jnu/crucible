import React from 'react';


export const GridControls = ({ width, height, onResize }) => (
    <div className="GridControls">
        <input type="text" value={width} onChange={e => onResize(+e.target.value, height)} />
        <input type="text" value={height} onChange={e => onResize(width, +e.target.value)} />
    </div>
);
