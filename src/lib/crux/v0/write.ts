import {BinaryString} from '../../BinaryString';
import {isDefined} from '../../isDefined';
import {HDR_VERSION_WIDTH} from '../constants';
import {CLUE_ACROSS_FLAG, CLUE_DOWN_FLAG} from './constants';
import {
  serializeValue,
  TYPE_CT0,
  TYPE_TS,
  CT0_BIT_WIDTH,
  CruxPuzzle,
} from '../types';

import * as utf8 from 'utf8';

/**
 * This current version of Crux.
 */
const CRUX_VERSION = 0;

/**
 * Bits in a byte
 */
const BYTE_LENGTH = 8;

/**
 * Number of bits needed to encode the CONTENT vs BLOCK distinction.
 */
const EMPTY_CELL_LENGTH = 1;

/**
 * Number of bits to encode a solution to a CONTENT cell.
 */
const CHAR_CELL_LENGTH = CT0_BIT_WIDTH;

/**
 * Number of bits to encode the number of bits used to encode each cell.
 * (No, that's not a typo. See README for more info.)
 */
const CELL_ENCODING_LENGTH_LENGTH = 3;

/**
 * Number of bits that encode each clue's index, direction, etc.
 */
const CLUE_META_LENGTH = 23;

/**
 * Number of bits used to encode grid dimension (width or height).
 */
const GRID_DIM_LENGTH = 7;

/**
 * Number of bits used to encode the length (in bits) of each meta-data field.
 * Namely, the fields are author, title, description, copyright.
 */
const META_FIELD_LENGTH_LENGTH = 14;

/**
 * Number of bits used to encode the length (in bits) of the clue section.
 */
const CLUE_LENGTH_LENGTH = 25;

/**
 * Number of bits used to encode timestamps.
 */
const TS_LENGTH = 32;

/**
 * Number of bits used to encode the length (in bits) of the annotations
 * section.
 */
const ANNOTATIONS_LENGTH_LENGTH = 24;

/**
 * Write out a string byte-by-byte into binary. This works equally well for
 * ASCII and UTF-8, but does not do any encoding of its own.
 *
 * !! MUTATES BINARY STRING !!
 */
const writeString = (binStr: BinaryString, str: string) => {
  if (!str) {
    return;
  }
  str
    .split('')
    .forEach((char) => binStr.write(char.charCodeAt(0), BYTE_LENGTH));
};

/**
 * Write date byte-by-byte as a 32-bit integer.
 *
 * !! MUTATES BINARY STRING !!
 */
const writeDate = (binStr: BinaryString, ts: number) => {
  const num = serializeValue(TYPE_TS, ts) | 0;
  const bytes = new Array(4);
  bytes[3] = (num >> 0) & 0xff;
  bytes[2] = (num >> 8) & 0xff;
  bytes[1] = (num >> 16) & 0xff;
  bytes[0] = (num >> 24) & 0xff;
  bytes.forEach((byte) => binStr.write(byte, BYTE_LENGTH));
};

type BinaryClue = {
  text: string;
  index: number;
  type: 0 | 1;
};

/**
 * Write clue content to binary string.
 *
 * !! MUTATES BINARY STRING !!
 */
const writeBinaryClue = (
  binaryString: BinaryString,
  {text, index, type}: BinaryClue,
) => {
  binaryString.write(index, 10);
  binaryString.write(type, 1);
  const length = text.length;
  binaryString.write(length, 12);
  writeString(binaryString, text);
};

/**
 * Write Crux object as binary string.
 */
export const write = (puzzle: CruxPuzzle) => {
  const content = puzzle.content;
  const clues = puzzle.clues;
  const width = puzzle.width;
  const height = puzzle.height;
  const author = utf8.encode(puzzle.author || '');
  const title = utf8.encode(puzzle.title || '');
  const description = utf8.encode(puzzle.description || '');
  const copyright = utf8.encode(puzzle.copyright || '');
  const currentTS = Date.now();
  const dateCreated = puzzle.dateCreated || currentTS;
  const lastModified = puzzle.lastModified || currentTS;

  const binStr = new BinaryString();

  // Collect stats
  const isEmpty = !content.some((cell) => !!cell.value);

  let numClues = 0;
  let clueContentLength = 0;

  const encodedClues = clues.map((clue) => {
    const across = clue.across;
    const down = clue.down;
    const hasAcross = isDefined(across);
    const hasDown = isDefined(down);
    numClues += Number(hasAcross) + Number(hasDown);
    const ret = {across: null, down: null} as {
      across: null | string;
      down: null | string;
    };

    if (hasAcross) {
      const encoded = utf8.encode(across);
      clueContentLength += encoded.length;
      ret.across = encoded;
    }
    if (hasDown) {
      const encoded = utf8.encode(down);
      clueContentLength += encoded.length;
      ret.down = encoded;
    }

    return ret;
  });

  // Derive header info
  // Overall width of clue section. Derived from counted UTf-8 bytes, plus
  // each clue's overhead.
  const clueLength = clueContentLength
    ? clueContentLength * BYTE_LENGTH + numClues * CLUE_META_LENGTH
    : 0;
  // Empty cells can be encoded with just 1 bit, others should use
  // a short int.
  const cellEncodingWidth = isEmpty ? EMPTY_CELL_LENGTH : CHAR_CELL_LENGTH;
  // TODO once annotations are supported in app
  const annotationLength = 0;

  // Write data as binary
  // Version
  binStr.write(CRUX_VERSION, HDR_VERSION_WIDTH);

  // Width
  binStr.write(width, GRID_DIM_LENGTH);

  // Height
  binStr.write(height, GRID_DIM_LENGTH);

  // Cell encoding width
  binStr.write(cellEncodingWidth, CELL_ENCODING_LENGTH_LENGTH);

  // Bits in clue section
  binStr.write(clueLength, CLUE_LENGTH_LENGTH);

  // Bits in annotation section (TODO)
  binStr.write(annotationLength, ANNOTATIONS_LENGTH_LENGTH);

  // Bits in meta-data sections. Note these are already UTF-8 encoded. It is
  // the encoded byte length that is being recorded here.
  binStr.write(title.length, META_FIELD_LENGTH_LENGTH);
  binStr.write(description.length, META_FIELD_LENGTH_LENGTH);
  binStr.write(copyright.length, META_FIELD_LENGTH_LENGTH);
  binStr.write(author.length, META_FIELD_LENGTH_LENGTH);

  // Write content body
  content.forEach((cell) => {
    const value = cell.type === 'BLOCK' ? null : cell.value || '';
    binStr.write(serializeValue(TYPE_CT0, value), cellEncodingWidth);
  });

  // Write clue body, if there are any clues to write.
  if (clueLength) {
    encodedClues.forEach(({across, down}, i) => {
      if (isDefined(across)) {
        writeBinaryClue(binStr, {
          text: across,
          index: i,
          type: CLUE_ACROSS_FLAG,
        });
      }

      if (isDefined(down)) {
        writeBinaryClue(binStr, {
          text: down,
          index: i,
          type: CLUE_DOWN_FLAG,
        });
      }
    });
  }

  // TODO annotations

  // Write meta-data
  writeString(binStr, title);
  writeString(binStr, description);
  writeString(binStr, copyright);
  writeString(binStr, author);
  writeDate(binStr, dateCreated);
  writeDate(binStr, lastModified);

  return binStr.getData();
};
