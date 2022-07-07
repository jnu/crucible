import {
  GridCell,
  IProgressStats,
  GridIronResponse,
  IWorkerMessage,
  IWebWorker,
  GridIronMessage,
} from './types';
import {fill} from './autofill';
import {WordBank, IJSONWordIndex} from '../readcross/WordBank';
import {Wordlist} from '../readcross';
import {Future} from '../Future';

type LocalScope = {
  fillFuture: Future<GridCell[]> | null;
  words: Wordlist | null;
};

/**
 * HACK: Better-typed alias for the global context. See IWebWorker for info.
 */
const ctx: IWebWorker & LocalScope = self as any;

/**
 * Any fill routine that's in process. (Could be null if none is ongoing.)
 */
ctx.fillFuture = null;

/**
 * Word list to use for analysis / solving. (This is null before initializing.)
 */
ctx.words = null;

/**
 * Post a message to the main thread.
 */
const _sendResponse = (response: GridIronResponse) => {
  ctx.postMessage(response);
};

/**
 * Send auto-fill solution to the main thread.
 */
const _sendSolution = (solution: GridCell[]) => {
  _sendResponse({
    type: 'SOLUTION',
    solution,
  });
};

/**
 * Send smoke test results to the main thread.
 */
const _sendSmokeTestResult = (solvable: boolean) => {
  _sendResponse({
    type: 'SMOKE_TEST',
    solvable,
  });
};

/**
 * Report an error to the main thread.
 */
const _sendError = (message: string) => {
  _sendResponse({
    type: 'ERROR',
    message,
  });
};

/**
 * Instantiate serialized WordBanks.
 */
const _inflateWordLists = (lists: {
  [key: string]: IJSONWordIndex[];
}): Wordlist => {
  const banks: {[key: string]: WordBank} = {};
  Object.keys(lists).forEach((key) => {
    banks[key] = WordBank.fromJSON(lists[key]);
  });
  return banks;
};

/**
 * Update solve progress.
 */
const _updateStats = (stats: IProgressStats) => {
  _sendResponse({
    type: 'PROGRESS',
    data: stats,
  });
};

/**
 * Run solve routine til it finishes.
 */
const solve = (grid: GridCell[], updateInterval: number) => {
  if (ctx.fillFuture) {
    console.warn('Processing already in progress!');
    return ctx.fillFuture.promise;
  }

  if (!ctx.words) {
    throw new Error('worker not inited');
  }

  ctx.fillFuture = fill(grid, ctx.words, _updateStats, updateInterval);

  return ctx.fillFuture.promise
    .then((solution) => {
      ctx.fillFuture = null;
      _sendSolution(solution);
      return solution;
    })
    .catch((e) => {
      _sendError(e instanceof Error ? e.message : '' + e);
    });
};

/**
 * Initialize the worker.
 */
const init = (wordlists: {[key: string]: IJSONWordIndex[]}) => {
  ctx.words = _inflateWordLists(wordlists);
  _sendResponse({type: 'READY'});
};

/**
 * Run smoke test to check solvability, bounded by the given interval.
 */
const smokeTest = async (grid: GridCell[], duration: number) => {
  if (ctx.fillFuture) {
    ctx.fillFuture.cancel();
  }

  if (!ctx.words) {
    throw new Error('worker not inited');
  }

  const t0 = Date.now();
  ctx.fillFuture = fill(
    grid,
    ctx.words,
    () => {
      if (Date.now() - t0 > duration) {
        ctx.fillFuture?.cancel();
      }
    },
    duration,
  );

  try {
    await ctx.fillFuture.promise;
    _sendSmokeTestResult(true);
  } catch (e) {
    const possible = /cancel/.test((e as Error).message);
    _sendSmokeTestResult(possible);
  } finally {
    ctx.fillFuture = null;
  }
};

/**
 * Cancel a running job.
 */
const abort = () => {
  if (!ctx.fillFuture) {
    console.warn('Requested to abort but no job was in process.');
    return;
  }
  ctx.fillFuture.cancel();
  ctx.fillFuture = null;
};

/**
 * Handle incoming messages.
 */
const dispatch = (message: IWorkerMessage<GridIronMessage>) => {
  switch (message.data.type) {
    case 'INIT':
      init(message.data.wordlists);
      break;
    case 'SOLVE':
      solve(message.data.grid, message.data.updateInterval || 500);
      break;
    case 'SMOKE_TEST':
      smokeTest(message.data.grid, message.data.duration);
      break;
    case 'ABORT':
      abort();
      break;
    default:
      throw new Error(`Unknown event type ${JSON.stringify(message)}`);
  }
};

// Install event listener to handle incoming messages from main thread.
self.addEventListener('message', (e) => {
  try {
    dispatch(e);
  } catch (e) {
    const msg = e instanceof Error ? e.message : `${e}`;
    _sendError(msg);
  }
});
