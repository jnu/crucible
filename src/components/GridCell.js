import React from 'react';
import { shallowEqual } from 'recompose';
import { bindAll } from 'lodash';


export class GridCell extends React.Component {

    constructor(props) {
        super(props);
        bindAll(this, 'doFocus', 'doContextMenu', 'doDoubleClick');
    }

    shouldComponentUpdate(props, nextProps) {
        return !shallowEqual(props, nextProps);
    }

    doFocus(e) {
        const { index, onFocus } = this.props;
        onFocus(index, e);
    }

    doContextMenu(e) {
        const { index, onRequestContext, onLoseContext } = this.props;
        e.preventDefault();

        const globalClickHandler = () => {
            onLoseContext();
            document.removeEventListener('click', globalClickHandler);
        };
        document.addEventListener('click', globalClickHandler);
        onRequestContext(index);
    }

    doDoubleClick(e) {
        const { index, onDoubleClick } = this.props;
        onDoubleClick(index, e);
    }

    getCellClassName(cell, focused, highlight) {
        const annotation = cell.get('annotation');
        const cns = ['GridCell', `GridCell-type-${cell.get('type').toLowerCase()}`];
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
                {!cell.get('startOfWord') ? null :
                    <span className="GridCell_clueIdx">{cell.get('startClueIdx') + 1}</span>
                }
                {cell.get('type') === 'BLOCK' ? null :
                    <span type="text"
                          className="GridCell_value">
                        {cell.get('value')}
                    </span>
                }
            </div>
        );
    }
}
