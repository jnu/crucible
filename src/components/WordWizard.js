import React from 'react';
import { connect } from 'react-redux';
import { List } from 'react-virtualized';
import { isDefined } from '../lib/isDefined';
import './WordWizard.scss';


/**
 * @typedef Crossing
 * @property {Number}  at - cursor position of extracted word
 * @property {String}  crossing - word at given crossing
 */

/**
 * Extract the word in the given direction from the grid at the given cursor.
 * Optionally extract all crossings with this word. The placeholder is used to
 * denote blank cells.
 * @param  {Immutable.List}  content - List of grid Cells
 * @param  {Number}  width - width of grid (used to iterate over DOWNs)
 * @param  {Number}  cursor - current cursor position
 * @param  {String}  direction - either ACROSS or DOWN; direction to extract
 * @param  {String}  placeholder - stand-in for empty cells
 * @param  {Boolean} withCrosses - whether to extract crossings as well.
 *                                 Note if this is set, only one level of
 *                                 crossings will be extracted.
 * @return {String|{ word: String, crosses: Crossing[]}}
 */
function pullWordFromContent(content, width, cursor, direction, placeholder, withCrosses = false) {
    const isAcross = direction === 'ACROSS';
    const cell = content.get(cursor);
    if (cell.get('type') === 'BLOCK') {
        return withCrosses ? { word: null, crosses: [] } : null;
    }
    const highlightKey = isAcross ? 'acrossWord' : 'downWord';
    const inc = isAcross ? 1 : width;
    const highlightWord = cell.get(highlightKey);
    // Initialize with given cell
    let word = cell.get('value') || placeholder;
    let crosses = [];
    // Recursively pull initial crossing if requested. Note recursion depth is
    // only ever one. Despite recursion we only ever scan at worst N+M cells,
    // where N is the total number of cells in the grid, and M is the length of
    // the initial target word. In most cases (i.e., grids with blocks) total
    // blocks scanned will be fewer than N.
    if (withCrosses) {
        crosses.push({
            crossing: pullWordFromContent(
                content,
                width,
                cursor,
                isAcross ? 'DOWN' : 'ACROSS',
                placeholder,
                false
            ),
            at: cursor
        });
    }

    // Scan all cells after current cell (to the right or down), then all the
    // cells before current one.
    for (let delta of [inc, -inc]) {
        let ptr = cursor;
        while (true) {
            ptr += delta;
            // Check bounds, especially less than zero, because Immutable
            // supports negative indexing.
            if (ptr < 0 || ptr >= content.size) {
                break;
            }
            let nextCell = content.get(ptr);
            if (nextCell && nextCell.get(highlightKey) === highlightWord) {
                let value = nextCell.get('value') || placeholder;
                let crossing;
                if (withCrosses) {
                    crossing = pullWordFromContent(
                        content,
                        width,
                        ptr,
                        isAcross ? 'DOWN' : 'ACROSS',
                        placeholder,
                        false
                    );
                }
                // Postpend or prepend value depending on search direction.
                if (delta > 0) {
                    word += value;
                    if (crossing) {
                        crosses.push({ crossing, at: ptr });
                    }
                } else {
                    word = value + word;
                    if (crossing) {
                        crosses.unshift({ crossing, at: ptr });
                    }
                }
            } else {
                break;
            }
        }
    }

    return withCrosses ? { crosses, word } : word;
}


function getCurrentWord(grid, placeholder = '*') {
    const content = grid.get('content');
    const cursor = grid.get('cursor');
    const cursorCell = content.get(cursor);
    if (!isDefined(cursorCell)) {
        return null;
    }

    const cursorDirection = grid.get('cursorDirection');

    let { word, crosses } = pullWordFromContent(
        content,
        grid.get('width'),
        cursor,
        cursorDirection,
        placeholder,
        true
    );

    // TODO return crossings
    return word;
}

// TODO issue crossings queries, restrict result set only to words that are
// valid at crossings. Probably want to include full result set, but sort so
// that valid crossings are shown prominently.
//
// REMEMBER that order in the crossings list corresponds to index of letter in
// word. Should also store the reverse index of the crossed word in the
// Crossing struct!
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
