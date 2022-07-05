import type {GridCell} from '../../reducers/grid';
import type {Wordlist} from '../readcross';
import {isDefined} from '../isDefined';
import {searchAllLists} from './util';

const WILDCARD = '*';

const WORD_KEYS = ['acrossWord', 'downWord'] as const;

/**
 * Pluck out all the queries for every word in the puzzle.
 *
 * Uses wildcards to fill in missing letters.
 */
const extractWordQueries = (content: GridCell[]) => {
  const queries = {
    acrossWord: new Map<number, string>(),
    downWord: new Map<number, string>(),
  };

  for (const cell of content) {
    for (const key of WORD_KEYS) {
      const w = cell[key];
      if (isDefined(w)) {
        const c = cell.value || WILDCARD;
        const q = queries[key].get(w);
        queries[key].set(w, q ? q + c : c);
      }
    }
  }

  return queries;
};

export const analyzeGrid = async (content: GridCell[], lists: Wordlist) => {
  const wordQueries = extractWordQueries(content);

  // Run all the word queries and save the returned lists
  const wordData = {
    acrossWord: new Map<number, string[]>(),
    downWord: new Map<number, string[]>(),
  };

  // Kick off search queries for every word in the grid, across and down.
  const p: Array<Promise<void>> = [];
  for (const key of WORD_KEYS) {
    const queries = wordQueries[key];
    for (const [id, q] of queries.entries()) {
      const promise = searchAllLists(q, lists).then((result) => {
        wordData[key].set(id, result);
      });
      p.push(promise);
    }
  }

  // Wait for all promises to come back.
  await Promise.all(p);

  // Return annotations for the grid based on returned metadata.
  return content.map((cell) => {
    if (cell.type === 'BLOCK') {
      return {
        acrossable: null,
        downable: null,
        heat: null,
      };
    }

    const acrossable = wordData.acrossWord.get(cell.acrossWord!)?.length || 0;
    const downable = wordData.downWord.get(cell.downWord!)?.length || 0;

    return {
      acrossable,
      downable,
      heat: !cell.value ? takeTemp(acrossable, downable) : 0,
    };
  });
};

/**
 * Come up with a rating in [0, 5] to indicate how hard this square will be
 * to fill.
 *
 * This is heuristic based on the number of viable crosses in the word list.
 *
 * A score of 5 means there are no crosses in at least one direction. At the
 * other end, 0 means there are a plethora of available words.
 */
const takeTemp = (acrossCount: number, downCount: number) => {
  const n = Math.min(downCount, acrossCount);

  if (n === 0) {
    return 5;
  } else if (n < 5) {
    return 4;
  } else if (n < 10) {
    return 3;
  } else if (n < 20) {
    return 2;
  } else if (n < 50) {
    return 1;
  }

  return 0;
};

/**
 * Type of the analysis that's returned.
 */
export type GridAnalysis = Awaited<ReturnType<typeof analyzeGrid>>;
