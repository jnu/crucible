import { isDefined } from '../../isDefined';
import { castValue, TYPE_TS, TYPE_CT0 } from '../types';
import * as utf8 from 'utf8';


/**
 * Read UTF-8 encoded unicode string with specified total byte length from
 * the given binary string. The cursor of the binary string should be at the
 * beginning of the string to read.
 * @param  {BinaryStringReader} binaryString
 * @param  {Number} length
 * @return {string}
 */
const readUnicodeString = (binaryString, length) => {
    if (!length) {
        return '';
    }

    const buffer = new Array(length);
    for (let i = 0; i < length; i++) {
        buffer.push(String.fromCharCode(binaryString.read(8)));
    }

    return utf8.decode(buffer.join(''));
};


/**
 * Read a timestamp from the binary string. Expected that the binary string's
 * cursor is at the start of the date. Increments cursor as it reads.
 * @param  {BinaryStringReader} binaryString
 * @return {Number} - TS in milliseconds since the epoch.
 */
const readDate = binaryString => {
    let ts = 0;
    ts += binaryString.read(8) << 24;
    ts += binaryString.read(8) << 16;
    ts += binaryString.read(8) << 8;
    ts += binaryString.read(8);
    return castValue(TYPE_TS, ts);
};


/**
 * Read the body of a Crux file as a binary string. It is expected that the
 * binary string reader's cursor is pointing to the body of the file when it
 * is passed here.
 * @param  {BinaryStringReader} binaryString
 * @param  {CruxHeaderV0} header
 * @return {{ content, clues }}
 */
export const read = (binaryString, header) => {
    const {
        gridWidth,
        gridHeight,
        cellEncodingWidth,
        cluesLength,
        titleLength,
        descriptionLength,
        authorLength,
        copyrightLength
    } = header;

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
    const clues = [];
    const clueBoundary = binaryString.cursor + cluesLength;
    while (binaryString.cursor < clueBoundary) {
        let index = binaryString.read(10);
        let direction = binaryString.read(1) ? 'down' : 'across';
        let otherDirection = direction === 'down' ? 'across' : 'down';
        let clueWidth = binaryString.read(12);
        let clue = '';
        // Read UTF-8 bytes and decode it
        for (let j = 0; j < clueWidth; j++) {
            let codePoint = binaryString.read(8);
            clue += String.fromCharCode(codePoint);
        }
        clue = utf8.decode(clue);
        let currentClue = clues[index];
        if (!currentClue) {
            clues[index] = {
                [direction]: clue,
                [otherDirection]: null
            };
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
