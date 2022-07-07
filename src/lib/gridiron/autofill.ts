import type {
  GridCell,
  IGridContentCell,
  IProgressStats,
  IGridWord,
} from './types';
import type {Wordlist} from '../readcross';
import {analyzeGrid} from './analyze';
import type {GridAnalysis} from './analyze';
import {Future} from '../Future';

/**
 *All valid letters in the grid.
 */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Clone an object.
 */
const clone = <T extends Object>(a: T[]) => a.map((o) => ({...o}));

/**
 * Callback to report stats to the UI.
 */
export type StatsCallback = (x: IProgressStats, jobId: string) => void;

/**
 * Broadcast stats back to the main thread if the time is right.
 */
const reportStats = (
  jobId: string,
  lastReport: number,
  interval: number,
  statsCallback: StatsCallback | undefined,
  stats: IProgressStats,
) => {
  if (!statsCallback) {
    return 0;
  }

  const now = Date.now();
  if (now - lastReport < interval) {
    return lastReport;
  }

  statsCallback(stats, jobId);

  return now;
};

/**
 * Get a unique hash of the current grid.
 */
const hashGrid = (grid: GridCell[]) => {
  let d = '';
  for (const c of grid) {
    d += c.type === 'BLOCK' ? '-' : c.value || '_';
  }
  return d;
};

/**
 * Fill the grid, returning a cancelable Future result.
 */
export const fill = (
  jobId: string,
  grid: GridCell[],
  lists: Wordlist,
  statsCallback?: StatsCallback,
  updateInterval: number = 500,
) => {
  const scope = {canceled: false};
  const result = solve(
    jobId,
    grid,
    lists,
    statsCallback,
    updateInterval,
    () => scope.canceled,
  );
  return new Future(result, () => {
    scope.canceled = true;
  });
};

/**
 * Fill the grid iteratively using the provided wordlists.
 */
const solve = async (
  jobId: string,
  grid: GridCell[],
  lists: Wordlist,
  statsCallback?: StatsCallback,
  updateInterval: number = 200,
  canceled: () => boolean = () => false,
) => {
  const cells = clone(grid);
  // Lock all the cells that are initially filled, regardless of whether the
  // values seem right. Just assume they are intentional.
  const locked = cells.map((c) => c.type === 'BLOCK' || !!c.value);

  const t0 = Date.now();
  const stats = {
    elapsedTime: 0,
    rate: 0,
    n: 0,
    backtracks: 0,
    pruned: 0,
    visits: 0,
    leftToSolve: 0,
    totalWords: 0,
    grid: cells,
    analysis: [] as GridAnalysis,
  };

  let _lastReported: number = 0;

  const gridStack = [clone(grid)];

  // The final solved puzzle
  let solution: GridCell[] | null = null;
  const visited = new Set<string>();

  // Loop until we get a solution or we run out of ideas.
  while (true) {
    if (canceled()) {
      throw new Error('job canceled');
    }

    if (gridStack.length === 0) {
      throw new Error('no more possibilities');
    }

    // Get the best grid to examine
    const currentGrid = gridStack[gridStack.length - 1];
    const hash = hashGrid(currentGrid);

    // Skip grid if it's been examined already.
    if (visited.has(hash)) {
      gridStack.pop();
      continue;
    }

    visited.add(hash);

    // Analyze current grid as a whole
    const analysis = await analyzeGrid(currentGrid, lists);

    // Interpret the analysis. In particular:
    //  0) Is the grid solved?
    //  1) Is the grid solvable?
    //  2) How many cells are left to solve?
    //  3) What's the index of the hardest cell to fill?
    const {solved, solvable, blankCells, hardestCellIdx} = interpretAnalysis(
      analysis,
      locked,
    );

    // Update stats and continue
    stats.leftToSolve = blankCells;
    stats.visits = visited.size;
    stats.elapsedTime = (Date.now() - t0) / 1000;
    stats.rate = stats.visits / stats.elapsedTime;
    stats.grid = currentGrid;
    stats.analysis = analysis;
    _lastReported = reportStats(
      jobId,
      _lastReported,
      updateInterval,
      statsCallback,
      stats,
    );

    // Best case, the grid is finished!
    if (solved) {
      solution = currentGrid;
      break;
    }

    // Worse case, the grid can't be solved :(
    if (!solvable) {
      gridStack.pop();
      stats.backtracks += 1;
      continue;
    }

    // Generate new candidates at the hardest cell to solve and repeat.
    // Prune the search space by considering only the letters that have words
    // in the wordlist at this position.
    const hardestCell = currentGrid[hardestCellIdx];
    const acrossIdx = hardestCell.acrossWordPos!;
    const downIdx = hardestCell.downWordPos!;
    const unchecked = new Set<string>(ALPHABET);
    for (const w of analysis[hardestCellIdx].acrossQuery.results) {
      for (const v of analysis[hardestCellIdx].downQuery.results) {
        const wx = w[acrossIdx];
        const vx = v[downIdx];
        if (wx === vx && unchecked.has(vx)) {
          unchecked.delete(vx);
          const newGrid = clone(currentGrid);
          newGrid[hardestCellIdx].value = vx;
          gridStack.push(newGrid);
        }

        // If the full alphabet is possible, just break because searching more
        // is a waste of time.
        if (unchecked.size === 0) {
          break;
        }
      }
    }

    // Tally how many branches we managed to prune.
    stats.pruned += unchecked.size;
  }

  // Update stats one more time
  stats.elapsedTime = Date.now() - t0 / 1000;
  stats.visits = visited.size;
  reportStats(jobId, 0, updateInterval, statsCallback, stats);

  // Return the solution (hopefully! might still be null)
  if (!solution) {
    throw new Error('no solution found');
  }

  return solution;
};

/**
 * Inspect the analysis result and generate actionable data based on it.
 */
const interpretAnalysis = (analysis: GridAnalysis, locked: boolean[]) => {
  let hardestScore = Infinity;
  let hardestIdx = -1;
  let emptyCount = 0;
  let impossibleCount = 0;

  for (let i = 0; i < analysis.length; i++) {
    const d = analysis[i];

    // Pass on locked cells. This includes both blocks, the cells that were
    // filled in the initial grid, and cells that have been filled with valid
    // letters in the autofill procedure.
    if (locked[i] || d.solvability === null || d.valid) {
      continue;
    }

    // Count how many cells left.
    emptyCount += d.filled ? 0 : 1;
    // Count how many cells are not possible to fill.
    impossibleCount += d.solvability === 0 ? 1 : 0;

    // Find the least cell that seems hardest to fill.
    if (d.solvability < hardestScore) {
      hardestScore = d.solvability;
      hardestIdx = i;
    }
  }

  return {
    solved: emptyCount === 0 && impossibleCount === 0,
    solvable: emptyCount > 0 && impossibleCount === 0,
    blankCells: emptyCount,
    hardestCellIdx: hardestIdx,
  };
};
