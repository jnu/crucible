import {log2} from '../log2';
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Puzzle binary file types
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Unsigned int type.
 */
export const TYPE_UINT = 'uint' as const;
/**
 * Boolean type
 */
export const TYPE_BOOL = 'bool' as const;
/**
 * 0th Char Table type. Objects of this type will be parsed as references to
 * CHAR_TABLE_0.
 */
export const TYPE_CT0 = 'ct0' as const;
/**
 * 32-bit timestamp representing seconds since the epoch.
 */
export const TYPE_TS = 'ts' as const;

/**
 * Any of the available data types in the file format.
 */
export type CruxDataType =
  | typeof TYPE_UINT
  | typeof TYPE_BOOL
  | typeof TYPE_CT0
  | typeof TYPE_TS;

/**
 * Any of the values that can be stored in the available data types.
 */
export type CruxDataValue = string | boolean | number | null;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Private character tables used for casting
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Character Table #0. Contains standard US crossword puzzle characters, and
 * some extra.
 * @type {Array}
 */
const CHAR_TABLE_0 = [
  null,
  '',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '?',
  '-',
  '/',
  '!',
];
/**
 * Inverse of Character Table #0.
 * @type {Array}
 */
const INV_CHAR_TABLE_0 = CHAR_TABLE_0.reduce((map, char, i) => {
  // NOTE: JS would implicitly convert `null` to `"null"`here; we do it
  // explicitly because TypeScript cares.
  map[char === null ? 'null' : char] = i;
  return map;
}, {} as {[k: string]: number});

/**
 * Max number of bits needed to encode character in CHAR_TABLE_0.
 * @type {Integer}
 */
export const CT0_BIT_WIDTH = Math.ceil(log2(CHAR_TABLE_0.length));

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Casting functions. Reference types defined above.s
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Cast an unsigned int to a type.
 */
export const castValue = (type: CruxDataType, value: number) => {
  switch (type) {
    case TYPE_UINT:
      return value;
    case TYPE_BOOL:
      return !!value;
    case TYPE_TS:
      return value * 1000;
    case TYPE_CT0:
      return CHAR_TABLE_0[value];
    default:
      throw new TypeError(`Unknown type: ${type}`);
  }
};

/**
 * Serialize a given type as an unsigned int. This is the inverse of castValue.
 */
export const serializeValue = (type: CruxDataType, value: unknown) => {
  switch (type) {
    case TYPE_UINT:
      return value as number;
    case TYPE_BOOL:
      return +(value as boolean);
    case TYPE_TS:
      return ~~(+(value as number) / 1000);
    case TYPE_CT0:
      if (!INV_CHAR_TABLE_0.hasOwnProperty(value as string)) {
        throw new Error(`Can't encoded value ${value} as CT0`);
      }
      return INV_CHAR_TABLE_0[value as string];
    default:
      throw new TypeError(`Unknown type: ${type}`);
  }
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Type definitions.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Represent a cell that has clues that can go both across and down.
 */
export type Clue = {
  across: string | null;
  down: string | null;
};

/**
 * Represent a crossword puzzle.
 */
export type CruxPuzzle = {
  content: Cell[];
  clues: Clue[];
  annotations?: null;
  author: string;
  title: string;
  copyright: string;
  description: string;
  dateCreated: number;
  lastModified: number;
  height: number;
  width: number;
};

/**
 * Type of the cell in a grid (block squares or content squares).
 */
export enum CellType {
  Content = 'CONTENT',
  Block = 'BLOCK',
}

/**
 * A content cell, i.e. a square in the grid containing a letter.
 */
export type ContentCell = {
  type: CellType.Content;
  value: string;
};

/**
 * A block (i.e., non-content cell).
 */
export type BlockCell = {
  type: CellType.Block;
  value?: null;
};

/**
 * Either a content cell or a block cell.
 */
export type Cell = ContentCell | BlockCell;

/**
 * Description of a metadata field.
 */
export type HeaderSchemaEntry = Readonly<{
  name: string;
  width: number;
  type: CruxDataType;
}>;

/**
 * List of header fields.
 */
export type HeaderSchema = ReadonlyArray<HeaderSchemaEntry>;

/**
 * Metadata about a puzzle.
 */
export type CruxHeader = {[k: string]: CruxDataValue};

/**
 * Grid clue/answer direction.
 */
export enum Direction {
  Down = 'DOWN',
  Across = 'ACROSS',
}
