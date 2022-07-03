import {IJSONWordIndex} from "../readcross/WordBank";

/**
 * Type of the cell in a grid (block squares or content squares).
 */
export enum CellType {
  Content = 'CONTENT',
  Block = 'BLOCK',
}

/**
 * A content cell, i.e. a square in the grid containing a letter.
 * TODO(jnu) move to shared location when converting other things to TS.
 */
export interface IGridContentCell {
    type: CellType.Content;
    startClueIdx: number;
    acrossWord: number;
    downWord: number;
    value: string;
    annotation?: string;
    startOfWord: boolean;
    _id?: string;
    _acrossWordRef?: IGridWord;
    _downWordRef?: IGridWord;
}

/**
 * A block (i.e., non-content cell).
 * TODO(jnu) move to shared location when converting other things to TS.
 */
export interface IGridBlockCell {
    type: CellType.Block;
    value: void;
    acrossWord: void;
    downWord: void;
    startClueIdx: void;
    annotation: void;
    startOfWord: boolean;
}

/**
 * Either a content cell or a block cell.
 * TODO(jnu) move to shared location when converting other things to TS.
 */
export type GridCell = IGridContentCell | IGridBlockCell;

/**
 * A word in the grid and the words that could potentially fill it.
 */
export interface IGridWord {
    cells: IGridContentCell[];
    size: number;
    choices?: string[];
}

/**
 * Statistics about performance and progress of algorithm.
 */
export interface IProgressStats {
    readonly elapsedTime: number;
    readonly rate: number;
    readonly n: number;
    readonly backtracks: number;
    readonly pruned: number;
    readonly visits: number;
    readonly leftToSolve: number;
    readonly totalWords: number;
}

/**
 * HACK: Typescript doesn't have good support for typing WebWorkers within
 * arbitrary projects, so define APIs here.
 * See https://github.com/Microsoft/TypeScript/issues/494 for more info.
 */
export interface IWebWorker {
    postMessage: (message: any) => void;
    addEventListener: (type: string, handler: (event: any) => void) => void;
}

export interface IGridIronSolveMessage {
    readonly type: 'SOLVE';
    readonly grid: GridCell[];
    readonly wordlists: {[key: string]: IJSONWordIndex[]};
    readonly updateInterval: number;
}

export interface IGridIronAbortMessage {
    readonly type: 'ABORT';
}

export type GridIronMessage = IGridIronSolveMessage | IGridIronAbortMessage;

interface IGridIronErrorResponse {
    readonly type: 'ERROR';
    readonly message: string;
}

interface IGridIronSolutionResponse {
    readonly type: 'SOLUTION';
    readonly solution: GridCell[];
}

interface IGridIronProgressResponse {
    readonly type: 'PROGRESS';
    readonly data: IProgressStats;
}

export type GridIronResponse = IGridIronErrorResponse | IGridIronSolutionResponse | IGridIronProgressResponse;

export interface IWorkerMessage<T> {
    data: T;
}
