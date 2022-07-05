import type {GridCell, GridState} from '../../reducers/grid';
import type {Crossing} from './types';
import {isDefined} from '../isDefined';
import {Direction} from '../crux';

/**
 * Serialize crossing array for semantic comparison
 */
const serializeCrosses = (crosses: Crossing[]) => {
  return crosses.map((c) => c.crossing).join(',');
};

/**
 * Extract the word in the given direction from the grid at the given cursor.
 * Optionally extract all crossings with this word. The placeholder is used to
 * denote blank cells.
 */
const pullWordFromContent = (
  content: ReadonlyArray<GridCell>,
  width: number,
  cursor: number,
  direction: Direction,
  placeholder: string,
  withCrosses = false,
): Readonly<{
  word: string | null;
  crosses: Crossing[];
  focusIdx: number;
}> => {
  const isAcross = direction === Direction.Across;
  const cell = content[cursor];
  if (cell.type === 'BLOCK') {
    return {word: null, crosses: [], focusIdx: -1};
  }

  const highlightKey = isAcross ? 'acrossWord' : 'downWord';
  const inc = isAcross ? 1 : width;
  const highlightWord = cell[highlightKey];
  // Initialize with given cell
  let curWord = cell.value || placeholder;
  let crosses = [];
  let curFocusIdx = 0;
  // Recursively pull initial crossing if requested. Note recursion depth is
  // only ever one. Despite recursion we only ever scan at worst N+M cells,
  // where N is the total number of cells in the grid, and M is the length of
  // the initial target word. In most cases (i.e., grids with blocks) total
  // blocks scanned will be fewer than N.
  if (withCrosses) {
    const {word, focusIdx} = pullWordFromContent(
      content,
      width,
      cursor,
      isAcross ? Direction.Down : Direction.Across,
      placeholder,
      false,
    );
    crosses.push({
      at: cursor,
      crossIdx: focusIdx,
      crossing: word || '',
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
      if (ptr < 0 || ptr >= content.length) {
        break;
      }
      let nextCell = content[ptr];
      if (nextCell && nextCell[highlightKey] === highlightWord) {
        let value = nextCell.value || placeholder;
        let crossData;
        if (withCrosses) {
          let {word, focusIdx} = pullWordFromContent(
            content,
            width,
            ptr,
            isAcross ? Direction.Down : Direction.Across,
            placeholder,
            false,
          );
          crossData = {crossing: word || '', at: ptr, crossIdx: focusIdx};
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

  return {crosses, word: curWord, focusIdx: curFocusIdx};
};

/**
 * Extract the current word from the grid, as well as all of the words that
 * cross this one. Use placeholder in lieu of missing values.
 */
export const getCurrentWord = (grid: GridState, placeholder = '*') => {
  const content = grid.content;
  const cursor = grid.cursor;
  if (cursor === null) {
    return null;
  }

  const cursorCell = content[cursor];
  if (!isDefined(cursorCell)) {
    return null;
  }

  const cursorDirection = grid.cursorDirection;

  let {word, crosses} = pullWordFromContent(
    content,
    grid.width,
    cursor,
    cursorDirection,
    placeholder,
    true,
  );

  return {word, crosses};
};
