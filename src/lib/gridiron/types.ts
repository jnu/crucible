/**
 * A content cell, i.e. a square in the grid containing a letter.
 * TODO(jnu) move to shared location when converting other things to TS.
 */
export interface IGridContentCell {
    type: 'CONTENT';
    startClueIdx: number;
    acrossWord: number;
    downWord: number;
    value: string;
    annotation: string | void;
    startOfWord: boolean;
    _id: string;
    _acrossWordRef: IGridWord;
    _downWordRef: IGridWord;
}

/**
 * A block (i.e., non-content cell).
 * TODO(jnu) move to shared location when converting other things to TS.
 */
export interface IGridBlockCell {
    type: 'BLOCK';
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