import {BASE64_CHAR_TO_INT} from './base64';


/**
 * Extract a window of bits from a Base64 encoded sequence
 * @param  {String} binary - base64 encoded sequence
 * @param  {Number} start - first bit to read
 * @param  {Number} len - number of bits to read
 * @return {Number} - bits from string, as number
 */
export function readBits(binary, start, len) {
    let startChar = ~~(start / 6);
    let startBitOffset = start % 6;
    let endBit = startBitOffset + len;
    let charLen = Math.ceil(endBit / 6);
    let mask = (0x1 << len) - 1;
    let chunk = 0;

    for (let i = 0; i < charLen; i++) {
        chunk <<= 6;
        chunk |= BASE64_CHAR_TO_INT[binary[startChar + i]];
    }

    let rightPadding = endBit % 6;
    if (rightPadding) {
        chunk >>= (6 - rightPadding);
    }

    return chunk & mask;
}
