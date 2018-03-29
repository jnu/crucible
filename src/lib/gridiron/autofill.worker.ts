import {GridCell, IProgressStats, GridIronResponse, IWorkerMessage, IWebWorker, GridIronMessage} from './types';
import {fill} from './autofill';
import {WordBank, IJSONWordIndex} from '../readcross/WordBank';
import {Future} from '../Future';

/**
 * HACK: Better-typed alias for the global context. See IWebWorker for info.
 */
const ctx: IWebWorker = (self as any);

let fillFuture: Future<GridCell[]> = null;

function _sendResponse(response: GridIronResponse) {
    ctx.postMessage(response);
}

function _sendSolution(solution: GridCell[]) {
    _sendResponse({
        type: 'SOLUTION',
        solution,
    });
}

function _sendError(message: string) {
    _sendResponse({
        type: 'ERROR',
        message,
    });
}

function _inflateWordLists(lists: {[key: string]: IJSONWordIndex[]}): {[key: string]: WordBank} {
    // TODO(jnu) ensure word banks are available here in worker context
    const banks: {[key: string]: WordBank} = {};
    Object.keys(lists).forEach(key => {
        banks[key] = WordBank.fromJSON(lists[key]);
    });
    return banks;
}

function _updateStats(stats: IProgressStats) {
    _sendResponse({
        type: 'PROGRESS',
        data: stats,
    });
}

function solve(grid: GridCell[], wordlists: {[key: string]: IJSONWordIndex[]}, updateInterval: number) {
    if (fillFuture) {
        _sendError('Processing is already started.');
        return fillFuture.promise;
    }
    const words = _inflateWordLists(wordlists)
    fillFuture = fill(grid, words, _updateStats, updateInterval);

    return (fillFuture.promise
        .then(solution => {
            fillFuture = null;
            _sendSolution(solution);
            return solution;
        })
        .catch(e => {
            _sendError(e instanceof Error ? e.message : '' + e);
        }));
}

function abort() {
    if (!fillFuture) {
        _sendError('No processing is in progress.');
        return;
    }
    fillFuture.cancel();
    fillFuture = null;
}

function dispatch(message: IWorkerMessage<GridIronMessage>) {
    switch (message.data.type) {
        case 'SOLVE':
            solve(message.data.grid, message.data.wordlists, message.data.updateInterval || 500);
            break;
        case 'ABORT':
            abort();
            break;
        default:
            throw new Error(`Unknown event type ${JSON.stringify(message)}`);
    }
}


self.addEventListener('message', dispatch);