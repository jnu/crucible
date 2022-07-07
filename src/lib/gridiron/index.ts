/**
 * Public interface to gridiron CSP solvers.
 */

import {IJSONWordIndex, WordBank} from '../readcross/WordBank';
import type {Wordlist} from '../readcross';
import {
  GridCell,
  IProgressStats,
  GridIronResponse,
  IWorkerMessage,
  IGridIronSolveMessage,
} from './types';
import {Deferred} from '../deferred';

// Re-export useful types.
export {IProgressStats} from './types';

/**
 * Container for a worker.
 */
type WorkerProcess = {
  thread: Worker;
  ready: Promise<void>;
};

/**
 * Background thread (null before initialization).
 */
let _worker: WorkerProcess | null = null;

/**
 * Fill in grid content based on initial constraints (i.e., the content given
 * in the input grid) and the provided word-lists.
 */
export const fill = async (
  grid: GridCell[],
  wordlist: Wordlist,
  statsCallback?: (x: IProgressStats) => void,
  updateInterval: number = 500,
): Promise<GridCell[]> => {
  if (_worker?.thread) {
    _sendCancel(_worker.thread);
  }

  const worker = await _initWorker(wordlist);

  const deferred = new Deferred<GridCell[]>();

  // Set up one-time event listener to listen for results.
  const handler = (event: IWorkerMessage<GridIronResponse>) => {
    switch (event.data.type) {
      case 'SOLUTION':
        // TODO: consider job id
        worker.removeEventListener('message', handler);
        return deferred.resolve(event.data.solution);
      case 'ERROR':
        // TODO: consider job id
        worker.removeEventListener('message', handler);
        return deferred.reject(new Error(event.data.message));
      case 'PROGRESS':
        if (statsCallback) {
          return statsCallback(event.data.data);
        }
        return;
      default:
        throw new Error(
          `Unknown event from worker ${JSON.stringify(event.data)}`,
        );
    }
  };

  worker.addEventListener('message', handler);
  worker.postMessage({
    type: 'SOLVE',
    grid,
    updateInterval,
  });

  return deferred.promise;
};

/**
 * Run the smoke test on a worker thread.
 */
export const smokeTest = async (
  grid: GridCell[],
  words: {[key: string]: WordBank},
  duration: number = 3000,
) => {
  const worker = await _initWorker(words);

  const deferred = new Deferred<boolean>();

  // Set up listener that will fetch result.
  const handler = (event: IWorkerMessage<GridIronResponse>) => {
    switch (event.data.type) {
      case 'SMOKE_TEST':
        // TODO: include job id
        worker.removeEventListener('message', handler);
        return deferred.resolve(event.data.solvable);
      case 'ERROR':
        // TODO: include job id
        worker.removeEventListener('message', handler);
        return deferred.reject(new Error(event.data.message));
      default:
        // Ignore
        console.info('Ignoring message', event.data);
    }
  };

  worker.addEventListener('message', handler);
  worker.postMessage({
    type: 'SMOKE_TEST',
    grid,
    duration,
  });

  return deferred.promise;
};

/**
 * Cancel any ongoing auto-fill job.
 */
export const cancel = () => {
  if (!_worker?.thread) {
    return;
  }

  _sendCancel(_worker.thread);
};

/**
 * Initialize the auto-fill worker thread.
 */
const _initWorker = async (wordlist: Wordlist) => {
  if (_worker) {
    await _worker.ready;
    return _worker.thread;
  }

  // Deferred promise that will resolve when the worker is initialized.
  const deferred = new Deferred<void>();

  // Create a new thread.
  // TODO: use a shared worker to make pooling easier?
  const thread = new Worker(new URL('./autofill.worker', import.meta.url));

  // Add a one-time message handler for initialization.
  const readyHandler = (event: IWorkerMessage<GridIronResponse>) => {
    switch (event.data.type) {
      case 'READY':
        thread.removeEventListener('message', readyHandler);
        return deferred.resolve();
      case 'ERROR':
        thread.removeEventListener('message', readyHandler);
        return deferred.reject(new Error(event.data.message));
      default:
        // ignore
        console.warn('Unexpected message from worker:', event.data);
    }
  };

  // Listen for the ready (or error) events.
  thread.addEventListener('message', readyHandler);

  // Send initialization signal
  _sendInit(thread, wordlist);

  // Set the singleton worker with the deferred promise that can be awaited
  // by anyone who calls it.
  _worker = {
    thread: thread,
    ready: deferred.promise,
  };

  // Now just wait for init!
  await _worker.ready;
  return _worker.thread;
};

/**
 * Convert word lists to simplified JSON for marshalling to background thread.
 */
const _serializeWordLists = (words: {
  [key: string]: WordBank;
}): {
  [key: string]: IJSONWordIndex[];
} => {
  const json: {[key: string]: IJSONWordIndex[]} = {};
  Object.keys(words).forEach((key) => {
    json[key] = words[key].toJSON();
  });
  return json;
};

/**
 * Send worker a message to cancel.
 */
const _sendCancel = (w: Worker) => {
  w.postMessage({type: 'ABORT'});
};

/**
 * Initialize the worker thread.
 */
const _sendInit = (w: Worker, wl: {[key: string]: WordBank}) => {
  const wordlists = _serializeWordLists(wl);
  w.postMessage({
    type: 'INIT',
    wordlists,
  });
};

// Other useful exports
export {analyzeGrid, GridAnalysis} from './analyze';
