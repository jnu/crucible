import {HDR_VERSION_WIDTH} from './constants';
import {castValue, HeaderSchema, CruxHeader, CruxPuzzle} from './types';
import {getCruxFileInterface, validateVersion} from './versions';
import {BinaryStringReader} from '../BinaryString';

/**
 * Parse version number from binary string.
 */
export const parseVersion = (binaryString: BinaryStringReader) => {
  const v = binaryString.readRange(0, HDR_VERSION_WIDTH);
  return validateVersion(v);
};

/**
 * Parse header into fields described by schema.
 */
export const parseHeaderWithSchema = (
  binaryString: BinaryStringReader,
  schema: HeaderSchema,
) => {
  const header: CruxHeader = {};
  schema.forEach((field) => {
    const {name, type, width} = field;
    const value = binaryString.read(width);
    header[name] = castValue(type, value);
  });
  return header;
};

/**
 * Parse Crux object from a binary string object.
 */
export const parseBinaryString = (binaryString: BinaryStringReader) => {
  const version = parseVersion(binaryString);
  const reader = getCruxFileInterface(version);
  const header = parseHeaderWithSchema(binaryString, reader.headerSchema);

  return reader.read(binaryString, header);
};

/**
 * Parse content from binary data. Binary should be base64 encoded string.
 */
export const read = (data: string): CruxPuzzle => {
  const binStr = new BinaryStringReader(data);
  return parseBinaryString(binStr);
};
