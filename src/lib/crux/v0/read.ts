import { isDefined } from '../../isDefined';
import { castValue, TYPE_TS, TYPE_CT0, CruxHeader, Clue} from '../types';
import type { BinaryStringReader } from '../../BinaryString';
import type { CruxHeaderV0 } from './headerSchema';

import * as utf8 from 'utf8';


/**
 * Read UTF-8 encoded unicode string with specified total byte length from
 * the given binary string. The cursor of the binary string should be at the
 * beginning of the string to read.
 */
const readUnicodeString = (binaryString: BinaryStringReader, length: number) => {
    if (!length) {
        return '';
    }

    const buffer = new Array(length);
    for (let i = 0; i < length; i++) {
        const c = binaryString.read(8);
        buffer[i] = String.fromCharCode(c);
    }

    const s = buffer.join('');
    try {
      return utf8.decode(s);
    } catch (e) {
      console.warn("Failed to decode string!", e);
      return s;
    }
};


/**
 * Read a timestamp from the binary string. Expected that the binary string's
 * cursor is at the start of the date. Increments cursor as it reads.
 */
const readDate = (binaryString: BinaryStringReader) => {
    let ts = 0;
    ts += binaryString.read(8) << 24;
    ts += binaryString.read(8) << 16;
    ts += binaryString.read(8) << 8;
    ts += binaryString.read(8);
    return castValue(TYPE_TS, ts) as number;
};


/**
 * Read the body of a Crux file as a binary string. It is expected that the
 * binary string reader's cursor is pointing to the body of the file when it
 * is passed here.
 */
export const read = (binaryString: BinaryStringReader, header: CruxHeader) => {
    const {
        gridWidth,
        gridHeight,
        cellEncodingWidth,
        cluesLength,
        titleLength,
        descriptionLength,
        authorLength,
        copyrightLength
    } = (header as CruxHeaderV0);

    if (!binaryString || !binaryString.cursor) {
        throw new Error('Binary string is not pointing at Crux body');
    }

    if (!header) {
        throw new Error('Crux header was not found');
    }

    // Parse grid content
    const contentLength = gridWidth * gridHeight;
    const content = new Array(contentLength);
    for (let i = 0; i < contentLength; i++) {
        let value = castValue(TYPE_CT0, binaryString.read(cellEncodingWidth));
        content[i] = {
            type: isDefined(value) ? 'CONTENT' : 'BLOCK',
            value
        };
    }

    // Parse clues
    const clues: Clue[] = [];
    const clueBoundary = binaryString.cursor + cluesLength;
    while (binaryString.cursor < clueBoundary) {
        const index = binaryString.read(10);
        const direction = binaryString.read(1) ? 'down' : 'across' as const;
        const otherDirection = direction === 'down' ? 'across' : 'down' as const;
        const clueWidth = binaryString.read(12);
        let clue = '';
        // Read UTF-8 bytes and decode it
        for (let j = 0; j < clueWidth; j++) {
            let codePoint = binaryString.read(8);
            clue += String.fromCharCode(codePoint);
        }
        clue = utf8.decode(clue);
        const currentClue = clues[index];
        if (!currentClue) {
            clues[index] = {
                [direction]: clue,
                [otherDirection]: null
            } as Clue;
        } else {
            currentClue[direction] = clue;
        }
    }

    // Parse annotations
    // TODO - when annotations are supported in crossword

    const title = readUnicodeString(binaryString, titleLength);
    const description = readUnicodeString(binaryString, descriptionLength);
    const copyright = readUnicodeString(binaryString, copyrightLength);
    const author = readUnicodeString(binaryString, authorLength);
    const dateCreated = readDate(binaryString);
    const lastModified = readDate(binaryString);

    return {
        content,
        clues,
        annotations: null,
        author,
        title,
        copyright,
        description,
        dateCreated,
        lastModified,
        height: gridHeight,
        width: gridWidth
    };
};
