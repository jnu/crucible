import {GridCell, IProgressStats, GridIronResponse, IWorkerMessage, IWebWorker, GridIronMessage} from './types';
import {fill} from './autofill';
import {WordBank, IJSONWordIndex} from '../readcross/WordBank';

/**
 * HACK: Better-typed alias for the global context. See IWebWorker for info.
 */
const ctx: IWebWorker = (self as any);

let lock = false;

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

function solve(grid: GridCell[], wordlists: {[key: string]: IJSONWordIndex[]}) {
    if (lock) {
        _sendError('Processing is locked');
        return;
    }
    lock = true;
    const words = _inflateWordLists(wordlists)
    fill(grid, words, _updateStats)
        .then(solution => {
            lock = false;
            _sendSolution(solution);
        });
}

function dispatch(message: IWorkerMessage<GridIronMessage>) {
    switch (message.data.type) {
        case 'SOLVE':
            solve(message.data.grid, message.data.wordlists);
        default:
            throw new Error(`Unknown event type ${message.data.type}`);
    }
}


self.addEventListener('message', dispatch);