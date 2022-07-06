import type {GridCell} from '../../reducers/grid';
import type {Wordlist} from '../readcross';
import {isDefined} from '../isDefined';
import {searchAllLists} from './util';
import {LRUCache} from '../LRUCache';

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

/**
 * Wordbank query cache.
 */
const Q_CACHE = new LRUCache<string[], string>(1e6);

/**
 * Examine grid and report solvability metrics for each cell.
 */
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
      const cached = Q_CACHE.getByKey(q);
      if (cached) {
        wordData[key].set(id, cached);
      } else {
        const promise = searchAllLists(q, lists).then((result) => {
          Q_CACHE.addByKey(q, result);
          wordData[key].set(id, result);
        });
        p.push(promise);
      }
    }
  }

  // Wait for all promises to come back.
  await Promise.all(p);

  // Return annotations for the grid based on returned metadata.
  return content.map((cell) => {
    if (cell.type === 'BLOCK') {
      return {
        acrossQuery: {
          query: null,
          results: [],
        },
        downQuery: {
          query: null,
          results: [],
        },
        acrossable: null,
        downable: null,
        heat: null,
        solvability: null,
      };
    }

    const acrossWords = wordData.acrossWord.get(cell.acrossWord!) || [];
    const downWords = wordData.downWord.get(cell.downWord!) || [];
    const acrossable = acrossWords.length;
    const downable = downWords.length;

    return {
      acrossQuery: {
        query: wordQueries.acrossWord.get(cell.acrossWord!),
        results: acrossWords,
      },
      downQuery: {
        query: wordQueries.downWord.get(cell.downWord!),
        results: downWords,
      },
      acrossable: acrossable,
      downable: downable,
      heat: !cell.value ? takeTemp(acrossable, downable) : 0,
      solvability: scoreSolvability(acrossable, downable),
      valid: !!cell.value && acrossable > 0 && downable > 0,
      filled: !!cell.value,
    };
  });
};

/**
 * Compute an approximate rank of "solvability" for this cell.
 *
 * If either of the across / down words have no possibilities, the score is 0,
 * meaning the cell is not solvable.
 *
 * If both scores have some possibilities, it's given a low score. Higher
 * scores mean that both the across and down scores have many words that are
 * able to fit.
 */
const scoreSolvability = (acrossCount: number, downCount: number) => {
  // The number is arbitrary. A good heuristic is just the number of available
  // solutions (take the min of both directions).
  return Math.min(acrossCount, downCount);
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
  } else if (n < 20) {
    return 3;
  } else if (n < 50) {
    return 2;
  } else if (n < 100) {
    return 1;
  }

  return 0;
};

/**
 * Type of the analysis that's returned.
 */
export type GridAnalysis = Awaited<ReturnType<typeof analyzeGrid>>;
