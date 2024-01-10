import {IJSONWordIndex} from '../readcross/WordBank';
import type {GridCellNotes} from '../../reducers/grid';
import type {BlockCell, ContentCell} from '../crux';
import type {GridAnalysis} from './analyze';

/**
 * Search for a given word.
 */
export type WordQuery = Readonly<{
  word: string | null;
  crosses: Crossing[];
}>;

/**
 * Represent a crossed word.
 */
export type Crossing = Readonly<{
  at: number;
  crossIdx: number;
  crossing: string;
}>;

/**
 * Represent a search result. Score is the strength of match, the match is
 * the matched word, and the hits indicate valid or invalid char positions.
 */
export type WordMatch = Readonly<{
  score: number;
  match: string;
  hits: boolean[];
  misses: boolean[];
}>;

/**
 * A content cell, i.e. a square in the grid containing a letter.
 */
export type IGridContentCell = ContentCell &
  GridCellNotes & {
    _id?: string;
    _acrossWordRef?: IGridWord;
    _downWordRef?: IGridWord;
  };

/**
 * A block (i.e., non-content cell).
 */
export type IGridBlockCell = BlockCell & GridCellNotes;

/**
 * Use a slightly modified grid cell during iteration.
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
  readonly grid: GridCell[];
  readonly analysis: GridAnalysis;
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

export interface IGridIronInitMessage {
  readonly type: 'INIT';
  readonly wordlists: {[key: string]: IJSONWordIndex[]};
  readonly jobId: string;
}

export interface IGridIronSolveMessage {
  readonly type: 'SOLVE';
  readonly grid: GridCell[];
  readonly updateInterval: number;
  readonly jobId: string;
}

export interface IGridIronAbortMessage {
  readonly type: 'ABORT';
  readonly jobId: string;
}

export interface IGridIronSmokeTestMessage {
  readonly type: 'SMOKE_TEST';
  readonly grid: GridCell[];
  readonly duration: number;
  readonly jobId: string;
}

export type GridIronMessage =
  | IGridIronSolveMessage
  | IGridIronAbortMessage
  | IGridIronSmokeTestMessage
  | IGridIronInitMessage;

interface IGridIronReadyResponse {
  readonly type: 'READY';
  readonly jobId: string;
}

interface IGridIronErrorResponse {
  readonly type: 'ERROR';
  readonly message: string;
  readonly jobId: string;
}

interface IGridIronSolutionResponse {
  readonly type: 'SOLUTION';
  readonly solution: GridCell[];
  readonly jobId: string;
}

interface IGridIronProgressResponse {
  readonly type: 'PROGRESS';
  readonly data: IProgressStats;
  readonly jobId: string;
}

interface IGridIronSmokeTestResponse {
  readonly type: 'SMOKE_TEST';
  readonly solvable: boolean;
  readonly jobId: string;
}

export type GridIronResponse =
  | IGridIronReadyResponse
  | IGridIronErrorResponse
  | IGridIronSolutionResponse
  | IGridIronProgressResponse
  | IGridIronSmokeTestResponse;

export interface IWorkerMessage<T> {
  data: T;
}
