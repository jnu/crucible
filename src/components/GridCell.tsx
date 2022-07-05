import React from 'react';
import {bindAll} from 'lodash';
import {isDefined} from '../lib/isDefined';
import type {GridCell as TGridCell} from '../reducers/grid';

export type GridCellProps = {
  cell: TGridCell;
  focused: boolean;
  highlight: boolean;
  left: number;
  top: number;
  size: number;
  index: number;
  heat?: number | null;
  onFocus: (i: number, e: React.MouseEvent<HTMLDivElement>) => void;
  onRequestContext: (i: number, x: number, y: number) => void;
  onDoubleClick: (i: number, e: React.MouseEvent<HTMLDivElement>) => void;
  onLoseContext: () => void;
};

export class GridCell extends React.Component<GridCellProps> {
  constructor(props: GridCellProps) {
    super(props);
    bindAll(this, 'doFocus', 'doContextMenu', 'doDoubleClick');
  }

  shouldComponentUpdate(nextProps: GridCellProps) {
    return this.props !== nextProps;
  }

  doFocus(e: React.MouseEvent<HTMLDivElement>) {
    const {index, onFocus} = this.props;
    onFocus(index, e);
  }

  doContextMenu(e: React.MouseEvent<HTMLDivElement>) {
    const {index, onRequestContext, onLoseContext} = this.props;
    e.preventDefault();

    const globalClickHandler = () => {
      onLoseContext();
      document.removeEventListener('click', globalClickHandler);
    };
    document.addEventListener('click', globalClickHandler);
    onRequestContext(index, e.clientX, e.clientY);
  }

  doDoubleClick(e: React.MouseEvent<HTMLDivElement>) {
    const {index, onDoubleClick} = this.props;
    onDoubleClick(index, e);
  }

  getCellClassName(
    cell: TGridCell,
    focused: boolean,
    highlight: boolean,
    heat?: number | null,
  ) {
    const annotation = cell.annotation;
    const cns = ['GridCell', `GridCell-type-${cell.type.toLowerCase()}`];
    // Show visual validation for unchecked crosses and too-short words
    if (
      !isDefined(cell.acrossWord) ||
      !isDefined(cell.downWord) ||
      (cell.acrossWordLength || 0) < 3 ||
      (cell.downWordLength || 0) < 3
    ) {
      cns.push('GridCell-invalid');
    }
    if (isDefined(heat)) {
      cns.push(`GridCell-heat-${heat}`);
    }
    if (annotation) {
      cns.push(`GridCell-annotation-${annotation}`);
    }
    if (focused) {
      cns.push('GridCell-focused');
    }
    if (highlight) {
      cns.push('GridCell-highlight');
    }
    return cns.join(' ');
  }

  render() {
    const {cell, focused, highlight, left, top, size, heat} = this.props;
    return (
      <div
        className={this.getCellClassName(cell, focused, highlight, heat)}
        onClick={this.doFocus}
        onDoubleClick={this.doDoubleClick}
        onContextMenu={this.doContextMenu}
        style={{
          position: 'absolute',
          left: left * size,
          top: top * size,
          height: size,
          width: size,
        }}>
        {!cell.startOfWord ? null : (
          <span className="GridCell_clueIdx">{cell.startClueIdx! + 1}</span>
        )}
        {cell.type === 'BLOCK' ? null : (
          <span className="GridCell_value">{cell.value}</span>
        )}
      </div>
    );
  }
}
