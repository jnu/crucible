import React from 'react';
import { connect } from 'react-redux';
import { List } from 'react-virtualized';
import { isDefined } from '../lib/isDefined';
import './WordWizard.scss';


/**
 * @typedef Crossing
 * @property {Number}  at - cursor position of extracted word
 * @property {Number}  crossIdx - Index of intersection in crossed word
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
 * @return {String|{ word: String, crosses: Crossing[], focusIdx: number }}
 */
function pullWordFromContent(content, width, cursor, direction, placeholder, withCrosses = false) {
    const isAcross = direction === 'ACROSS';
    const cell = content.get(cursor);
    if (cell.get('type') === 'BLOCK') {
        return { word: null, crosses: [], focusIdx: -1 };
    }
    const highlightKey = isAcross ? 'acrossWord' : 'downWord';
    const inc = isAcross ? 1 : width;
    const highlightWord = cell.get(highlightKey);
    // Initialize with given cell
    let curWord = cell.get('value') || placeholder;
    let crosses = [];
    let curFocusIdx = 0;
    // Recursively pull initial crossing if requested. Note recursion depth is
    // only ever one. Despite recursion we only ever scan at worst N+M cells,
    // where N is the total number of cells in the grid, and M is the length of
    // the initial target word. In most cases (i.e., grids with blocks) total
    // blocks scanned will be fewer than N.
    if (withCrosses) {
        const { word, focusIdx } = pullWordFromContent(
            content,
            width,
            cursor,
            isAcross ? 'DOWN' : 'ACROSS',
            placeholder,
            false
        );
        crosses.push({
            at: cursor,
            crossIdx: focusIdx,
            crossing: word
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
                let crossData;
                if (withCrosses) {
                    let { word, focusIdx } = pullWordFromContent(
                        content,
                        width,
                        ptr,
                        isAcross ? 'DOWN' : 'ACROSS',
                        placeholder,
                        false
                    );
                    crossData = { crossing: word, at: ptr, crossIdx: focusIdx };
                }
                // Postpend or prepend value depending on search direction.
                if (delta > 0) {
                    curWord += value;
                    if (crossData) {
                        crosses.push(crossData);
                    }
                } else {
                    curFocusIdx += 1;
                    curWord = value + curWord;
                    if (crossData) {
                        crosses.unshift(crossData);
                    }
                }
            } else {
                break;
            }
        }
    }

    return { crosses, word: curWord, focusIdx: curFocusIdx };
}


/**
 * Extract the current word from the grid, as well as all of the words that
 * cross this one. Use placeholder in lieu of missing values.
 * @param  {Grid} grid
 * @param  {String} placeholder
 * @return {{ word: String, crosses: Crossing[] }}
 */
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

    return { word, crosses };
}


/**
 * @typedef WordMatch
 * @property {Number} score - strength of match
 * @property {String} match - matched word
 * @property {Boolean[]} hits - indicates whether char in `match` would be
 *                              potentially acceptable at a crossing.
 */


/**
 * Search all word lists for the given query. The query consists of a word and
 * all the crossings of this word.
 * @param  {{ [id: string]: WordBank }} lists - word banks to query
 * @param  {{ word: string, crosses: Crossing[] }} query - word query
 * @return {WordMatch[]} - sorted by score and alphanumerically
 */
function searchWordLists(lists, query) {
    // TODO One-level-deep crossing queries are sort of helpful, but a little
    // confusing to work with. Do we have to validate multiple levels?
    const allLists = lists.valueSeq().toJS();
    const searchAll = word =>
        !word ? Promise.resolve([]) : Promise
            .all(allLists.map(list => list.search(word)))
            // TODO may want to include source metadata. For now, just glom all
            // results together no matter which list they came from.
            .then(words => words.reduce((agg, list) => agg.concat(list), []));
    const { word, crosses } = query;
    // Fetch all sets of all possible words at crossings
    const crossesPromise = Promise.all(
            crosses.map(({ crossing }) => searchAll(crossing))
        )
        // Create a Set of acceptable chars for each crossing
        .then(crossMatches => {
            return crossMatches.map((matches, i) => {
                const { crossIdx } = crosses[i];
                return matches.reduce((chars, match) => chars.add(match[crossIdx]), new Set());
            });
        });
    // Fetch possible words for highlighted query, then partition into words
    // that are validated at all crossings and words that are not.
    // TODO could rank by # of chars matched (and highlight in UI).
    return Promise.all([
            searchAll(word),
            crossesPromise
        ]).then(([naiveMatches, charsAtCrossings]) => {
            return naiveMatches.map(match => {
                let score = 0;
                const hits = charsAtCrossings.map((chars, i) => {
                    const has = chars.has(match[i]);
                    score += has;
                    return has;
                });
                return {
                    match,
                    score,
                    hits
                };
            });
        }).then(matchMap => {
            // Sort results by match score, then alphabetically.
            return matchMap.sort((a, b) => {
                return a.score > b.score ? -1 :
                    a.score === b.score ?
                        (a.match < b.match ? -1 : 1) : 1;
            });
        });
}


/**
 * Serialize crossing array for semantic comparison
 * @param  {Crossing[]} crosses
 * @return {String}
 */
function serializeCrosses(crosses) {
    return crosses.map(c => c.crossing).join(',');
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
        return (
            this.state.query &&
            nextQuery &&
            this.state.query.word === nextQuery.word &&
            this.props.wordlist === wordlist &&
            serializeCrosses(this.state.query.crosses) === serializeCrosses(nextQuery.crosses)
        );
    }

    componentWillReceiveProps(nextProps) {
        const nextQuery = getCurrentWord(nextProps.grid);
        // No current word means no query; reset to initial state.
        if (!nextQuery || !nextQuery.word) {
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
                            fetching: false,
                            error: null
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
        const { match, hits } = this.state.matches[index];
        return (
            <div key={key} style={style}>{
                hits.map((hit, i) => <span className={hit ? 'match-hit' : 'match-miss'}>{match[i]}</span>)
            }</div>
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
