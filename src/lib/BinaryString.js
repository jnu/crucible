/**
 * Extract a window of bits from a Base64 encoded sequence
 * @param  {String} binary - base64 encoded sequence
 * @param  {Number} start - first bit to read
 * @param  {Number} len - number of bits to read
 * @return {Number} - bits from string, as number
 */
function readBits(binary, start, len) {

}


/**
 * @file Provide an interface for writing binary data into a Base64-encoded
 * string.
 */

import floor_log2 from './floor_log2';
import {
    BASE64_INT_TO_CHAR,
    BASE64_CHAR_TO_INT
} from './base64';


/**
 * Interface for writing binary data into a Base64-encoded string
 * @class
 */
class BinaryString {

    /**
     * No arguments are necessary.
     * @constructor
     * @return {BinaryString}
     */
    constructor(data) {
        /**
         * Data buffer
         * @type {Number?}
         */
        this.buffer = 0;

        /**
         * Word pointer for buffer. With every entry into the buffer, the
         * pointer gets incremented by the entry's width. Every six characters
         * may be encoded, so when the pointer exceeds 6, the buffer can be
         * emptied until the pointer is back under 6.
         * @type {Number}
         */
        this.pointer = 0;

        /**
         * Encoded data as a string of base64 characters
         * @type {String}
         */
        this.data = data || '';

        /**
         * Data is read-only if the instance was initialized with a string.
         * @type {Boolean}
         */
        this.canWrite = !data;
    }

    /**
     * Write a value to the binary string. This value should be thought of as
     * an integer representing the binary data to write.
     * @param  {Integer} val - data to write
     * @param  {Integer} [width] - optionally specify a width for this data.
     *                             if none is given, width will be inferred
     *                             automatically. An error will be thrown if
     *                             the width is too small to contain the data.
     */
    write(val, width = null) {
        if (!this.canWrite) {
            throw new Error('BinaryString is read-only');
        }

        let buf = this.buffer;
        let len = width || floor_log2(val) + 1;

        if (width && val >= (0x1 << width)) {
            throw new Error(`Can't write ${val} in only ${width} bits`);
        }

        this.buffer = (buf << len) | val;
        this.pointer += len;

        this._digest();
    }

    /**
     * Encode the remaining items in the buffer. Use this when the input stream
     * is finished to ensure that all data has been encoded.
     */
    flush() {
        if (!this.canWrite) {
            throw new Error('BinaryString is read-only');
        }

        let buffer = this.buffer;
        let pointer = this.pointer;
        // NB if pointer is at 0, there's nothing to flush.
        while (pointer && pointer < 6) {
            buffer <<= 1;
            pointer += 1;
        }
        this.pointer = pointer;
        this.buffer = buffer;
        this._digest();
    }

    /**
     * Get the binary data as base64. This output does not include padding
     * characters. This procedure flushes the buffer.
     * @return {String}
     */
    getData() {
        if (this.canWrite) {
            this.flush();
        }
        return this.data;
    }

    /**
     * Read a number of bits from the binary string.
     * @param  {Number} start - bit at which to start reading
     * @param  {Number} [len=1] - number of bits to read
     * @return {Number} Integer representing what was read.
     */
    read(start, len = 1) {
        if (this.canWrite) {
            throw new Error('BinaryString is write-only');
        }
        const binary = this.data;

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

    /**
     * Write values from the buffer into the binary encoded string until the
     * pointer is below 6. Use @link BinaryString#flush to print out all values
     * regardless of whether they are complete and return the pointer to 0.
     *
     * This method is used internally during writes and does not need to be
     * called explicitly.
     * @private
     */
    _digest() {
        let buffer = this.buffer;
        let pointer = this.pointer;
        let newData = '';
        while (pointer >= 6) {
            let remainder = (pointer - 6);
            let code = buffer >> remainder;
            buffer = buffer ^ (code << remainder);
            pointer = remainder;
            newData += BASE64_INT_TO_CHAR[code];
        }
        this.pointer = pointer;
        this.buffer = buffer;
        this.data += newData;
    }

}

export default BinaryString;
