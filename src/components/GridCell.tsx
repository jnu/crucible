import React from 'react';
import { shallowEqual } from 'recompose';
import { bindAll } from 'lodash';
import type {GridCell as TGridCell} from '../lib/crux';

export type GridCellProps = {
  cell: TGridCell;
  focused: boolean;
  highlight: boolean;
  left: number;
  top: number;
  size: number;
  index: number;
  onFocus: (i: number, e: React.MouseEvent<HTMLDivElement>) => void;
  onRequestContext: (i: number) => void;
  onDoubleClick: (i: number, e: React.MouseEvent<HTMLDivElement>) => void;
  onLoseContext: () => void;
};

export class GridCell extends React.Component<GridCellProps> {

    constructor(props: GridCellProps) {
        super(props);
        bindAll(this, 'doFocus', 'doContextMenu', 'doDoubleClick');
    }

    shouldComponentUpdate(nextProps: GridCellProps) {
        return !shallowEqual(this.props, nextProps);
    }

    doFocus(e: React.MouseEvent<HTMLDivElement>) {
        const { index, onFocus } = this.props;
        onFocus(index, e);
    }

    doContextMenu(e: React.MouseEvent<HTMLDivElement>) {
        const { index, onRequestContext, onLoseContext } = this.props;
        e.preventDefault();

        const globalClickHandler = () => {
            onLoseContext();
            document.removeEventListener('click', globalClickHandler);
        };
        document.addEventListener('click', globalClickHandler);
        onRequestContext(index);
    }

    doDoubleClick(e: React.MouseEvent<HTMLDivElement>) {
        const { index, onDoubleClick } = this.props;
        onDoubleClick(index, e);
    }

    getCellClassName(cell: TGridCell, focused: boolean, highlight: boolean) {
        const annotation = cell.annotation;
        const cns = ['GridCell', `GridCell-type-${cell.type.toLowerCase()}`];
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
        const {
            cell,
            focused,
            highlight,
            left,
            top,
            size
        } = this.props;
        return (
            <div className={this.getCellClassName(cell, focused, highlight)}
                 onClick={this.doFocus}
                 onDoubleClick={this.doDoubleClick}
                 onContextMenu={this.doContextMenu}
                 style={{
                    position: 'absolute',
                    left: left * size,
                    top: top * size,
                    height: size,
                    width: size
                }}>
                {!cell.startOfWord ? null :
                    <span className="GridCell_clueIdx">{cell.startClueIdx! + 1}</span>
                }
                {cell.type === 'BLOCK' ? null :
                    <span className="GridCell_value">
                        {cell.value}
                    </span>
                }
            </div>
        );
    }
}
