import { HDR_VERSION_WIDTH } from './constants';
import { castValue } from './types';
import { getCruxFileInterface } from './versions';
import { BinaryStringReader } from '../BinaryString';


/**
 * Parse version number from binary string.
 * @param  {BinaryString} binaryString
 * @return {Number}
 */
export const parseVersion = (binaryString) => {
    return binaryString.readRange(0, HDR_VERSION_WIDTH);
};


/**
 * Parse header into fields described by schema.
 * @param  {BinaryString} binaryString
 * @param  {PuzzleHeaderField[]} schema
 * @return {CruxHeader}
 */
export const parseHeaderWithSchema = (binaryString, schema) => {
    const header = {};
    schema.forEach(field => {
        const { name, type, width } = field;
        const value = binaryString.read(width);
        header[name] = castValue(type, value);
    });
    return header;
};


/**
 * Parse Crux object from a binary string object.
 * @param  {BinaryString} binaryString
 * @return {CruxObject}
 */
export const parseBinaryString = binaryString => {
    const version = parseVersion(binaryString);
    const reader = getCruxFileInterface(version);
    const header = parseHeaderWithSchema(binaryString, reader.headerSchema);

    return reader.read(binaryString, header);
};


/**
 * Parse content from binary data. Binary should be base64 encoded string.
 * @param  {string} data
 * @return {CruxObject}
 */
export const read = data => {
    const binStr = new BinaryStringReader(data);
    return parseBinaryString(binStr);
};
