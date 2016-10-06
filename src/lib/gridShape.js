import Immutable from 'immutable';
import BinaryString from './BinaryString';


/**
 * Bit width of meta field. This must be wide enough to contain the max width
 * or height of the crossword. We assume that a 127 x 127 crossword will be
 * big enough for any reasonable use, though I still feel weird about imposing
 * a limit.
 * @type {Number}
 */
const GRID_DIM_FIELD = 7;


// Interesting ones:
// HgcOGDwAYAAABAAAAQEeAAQADxAQAAAEAAAAwAeDD

/**
 * Encode a crossword grid shape as binary.
 * @param  {Immutable.List<Cell>} content
 * @param  {Number} options.width - width of puzzle
 * @param  {Number} options.height - height of puzzle
 * @return {String} base64-encoded binary data
 */
export const gridShapeToBitmap = (content, { width, height }) => {
    const binStr = new BinaryString();
    const maxDim = Math.pow(2, GRID_DIM_FIELD);

    if (width >= maxDim) {
        throw new Error(`Grid is too wide. Max width is ${maxDim}`);
    }

    if (height >= maxDim) {
        throw new Error(`Grid is too tall. Max height is ${maxDim}`);
    }

    // Write out binary data
    binStr.write(width, GRID_DIM_FIELD);
    binStr.write(content.size, GRID_DIM_FIELD * 2);
    content.forEach(cell => binStr.write(cell.get('type') === 'BLOCK', 1));

    return binStr.getData();
};


/**
 * Deserialize a binary encoded grid. This grid does not include any answers,
 * only the outline.
 * @param  {String} bitmap - binary encoded grid
 * @return {{content, width, height}}
 */
export const bitmapToGridShape = bitmap => {
    const binStr = new BinaryString(bitmap);
    const width = binStr.read(0, GRID_DIM_FIELD);
    const length = binStr.read(GRID_DIM_FIELD, GRID_DIM_FIELD * 2);
    const height = length / width;
    const offset = GRID_DIM_FIELD * 3;
    const content = new Array(length);
    for (let i = 0; i < length; i++) {
        content[i] = binStr.read(offset + i, 1) ? 'BLOCK' : 'CONTENT'
    }
    return {
        content: Immutable.List(content),
        width,
        height
    };
};
