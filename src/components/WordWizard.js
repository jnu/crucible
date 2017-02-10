import React from 'react';
import { connect } from 'react-redux';
import { List } from 'react-virtualized';
import { isDefined } from '../lib/isDefined';
import './WordWizard.scss';



function getCurrentWord(grid, placeholder = '*') {
    const content = grid.get('content');
    const cursor = grid.get('cursor');
    const cursorCell = content.get(cursor);
    if (!isDefined(cursorCell)) {
        return null;
    }

    const cursorDirection = grid.get('cursorDirection');
    const highlightKey = cursorDirection === 'ACROSS' ? 'acrossWord' : 'downWord';
    const highlightWord = cursorCell.get(highlightKey);
    if (!isDefined(highlightWord)) {
        return null;
    }

    // Iterate over grid, building token to search.
    let word = '';
    // TODO could optimize by only searching adjacent cells
    content.forEach(cell => {
        if (cell.get(highlightKey) === highlightWord) {
            word += cell.get('value') || placeholder;
        }
    });
    return word;
}

function searchWordLists(lists, query) {
    return Promise.all(
            lists.valueSeq().toJS().map(list => list.search(query))
        ).then(
            matches => matches.reduce((agg, list) => agg.concat(list), [])
        );
}


const INITIAL_WIZARD_STATE = {
    query: null,
    matches: [],
    fetching: false,
    error: null
};

const wordWizardStyle = {
    height: '100%',
    overflow: 'auto'
};


class WordWizardView extends React.Component {

    constructor(props) {
        super(props);
        this.state = INITIAL_WIZARD_STATE;
        this._renderListRow = this._renderListRow.bind(this);
    }

    /**
     * Check if potential matches in state might have changed. Assume that
     * potential matches are deterministic given wordlist state and nextQuery.
     * @param  {Wordlist} wordlist - wordlist state tree
     * @param  {String} nextQuery - next query
     * @return {boolean}
     */
    _areMatchesCurrent(wordlist, nextQuery) {
        return this.state.query === nextQuery && this.props.wordlist === wordlist;
    }

    componentWillReceiveProps(nextProps) {
        const nextQuery = getCurrentWord(nextProps.grid);
        // No current word means no query; reset to initial state.
        if (!nextQuery) {
            this.setState(INITIAL_WIZARD_STATE);
            return;
        }
        // If potential matches might've changed, need to recomputed.
        if (!this._areMatchesCurrent(nextProps.wordlist, nextQuery)) {
            const searchPromise = searchWordLists(nextProps.wordlist.get('lists'), nextQuery);
            // Set "now searching" state
            this.setState({
                query: nextQuery,
                matches: [],
                fetching: true,
                error: null
            });
            // Update state when promise returns.
            searchPromise
                .then(matches => {
                    // Only update if state is current, otherwise drop.
                    if (this._areMatchesCurrent(nextProps.wordlist, nextQuery)) {
                        this.setState({
                            matches,
                            fetching: false
                        });
                    }
                })
                .catch(error => {
                    // Only update if state is current, otherwise drop.
                    if (this._areMatchesCurrent(nextProps.wordlist, nextQuery)) {
                        this.setState({
                            matches: [],
                            fetching: false,
                            error
                        });
                    }
                });
        }
    }

    _renderListRow({ key, index, style }) {
        const word = this.state.matches[index];
        return (
            <div key={key} style={style}>{word}</div>
        );
    }

    render() {
        const { query, fetching, matches, error } = this.state;
        const matchesUi = query === null ?
            <div>{/* TODO: placeholder? */}</div> :
            fetching ?
            <div>Finding words ...</div> :
            error ?
            <div>Error fetching words: {error}</div> :
            <div>
                <List width={300}
                      height={300}
                      rowCount={matches.length}
                      rowHeight={20}
                      rowRenderer={this._renderListRow} />
            </div>
            ;
        return (
            <div className="WordWizard" style={wordWizardStyle}>
                <div>{matchesUi}</div>
            </div>
        );
    }

}


const mapStateToProps = ({ grid, wordlist }) => ({ grid, wordlist });
const mapDispatchToProps = dispatch => ({});

export const WordWizard = connect(mapStateToProps, mapDispatchToProps)(WordWizardView);
