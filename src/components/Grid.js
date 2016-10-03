import React from 'react';
import { shallowEqual } from 'recompose';
import { GridContent } from './GridContent';
import { Clues } from './Clues';
import './Grid.scss';


export class Grid extends React.Component {

    shouldComponentUpdate(props, nextProps) {
        return !shallowEqual(props, nextProps);
    }

    componentDidMount() {
        const cmp = this;

        cmp.mouseClickListener = e => {
            const { gridContentRoot } = cmp;
            const { target } = e;

            if (!gridContentRoot) {
                if (DEBUG) {
                    console.warn('Did not find grid content root');
                }
                return;
            }

            // Focus event
            if (gridContentRoot.contains(target)) {
                cmp.setKeyListener(cmp);
            } else {
                cmp.removeKeyListener(cmp);
            }
        }

        window.addEventListener('click', cmp.mouseClickListener);
    }

    componentWillUnmount() {
        this.removeKeyListener(this);
        if (this.mouseClickListener) {
            window.removeEventListener('click', this.mouseClickListener);
        }
    }

    removeKeyListener(cmp) {
        if (cmp.keyDownListener) {
            window.removeEventListener('keydown', cmp.keyDownListener);
            cmp.keyDownListener = null;
        }
    }

    setKeyListener(cmp) {
        if (cmp.keyDownListener) {
            return;
        }

        cmp.keyDownListener = e => {
            const handler = cmp.props.onKeyDown;
            const grid = cmp.props.grid;
            if (!handler || !grid) {
                return;
            }
            handler(
                e,
                grid.get('selectedCell'),
                grid.get('selectedDirection'),
                grid.get('content')
            );
            e.preventDefault();
        }

        window.addEventListener('keydown', cmp.keyDownListener);
    }

    render() {
        const {
            grid,
            onResize,
            onBlur,
            onFocusCell,
            onUpdateCell,
            onLoseCellContext,
            onRequestCellContext,
            onChangeClue
        } = this.props;
        const width = grid.get('width');
        const height = grid.get('height');
        const clues = grid.get('clues');
        const content = grid.get('content');
        const cellSize = grid.get('cellSize');
        const selectedDirection = grid.get('selectedDirection');
        const selectedCell = grid.get('selectedCell');
        const menuCell = grid.get('menuCell');

        return (
            <div className="Grid">
                <input type="text"
                       value={width}
                       onChange={e => onResize(+e.target.value, height)} />
                <input type="text"
                       value={height}
                       onChange={e => onResize(width, +e.target.value)} />
                <div className="Grid_HorizontalContainer" style={{ height: 50 + cellSize * height }}>
                    <Clues type="across"
                           title="Across"
                           onChange={onChangeClue}
                           clues={clues}
                           content={content} />
                    <div className="Grid_GridContent-container"
                         ref={target => this.gridContentRoot = target}>
                        <GridContent content={content}
                                     onFocusCell={onFocusCell}
                                     onUpdateCell={onUpdateCell}
                                     onLoseCellContext={onLoseCellContext}
                                     onRequestCellContext={onRequestCellContext}
                                     selectedCell={selectedCell}
                                     menuCell={menuCell}
                                     cellSize={cellSize} />
                    </div>
                </div>
                <div className="Grid_HorizontalContainer">
                    <Clues type="down"
                           title="Down"
                           onChange={onChangeClue}
                           clues={clues}
                           content={content} />
                </div>
            </div>
        );
    }

}
