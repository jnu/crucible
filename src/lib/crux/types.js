import { log2 } from '../log2';
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Puzzle binary file types
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Unsigned int type.
 * @type {Type}
 */
export const TYPE_UINT = 'uint';
/**
 * Boolean type
 * @type {Type}
 */
export const TYPE_BOOL = 'bool';
/**
 * 0th Char Table type. Objects of this type will be parsed as references to
 * CHAR_TABLE_0.
 * @type {Type}
 */
export const TYPE_CT0 = 'ct0';
/**
 * 32-bit timestamp representing seconds since the epoch.
 * @type {Type}
 */
export const TYPE_TS = 'ts';


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Private character tables used for casting
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Character Table #0. Contains standard US crossword puzzle characters, and
 * some extra.
 * @type {Array}
 */
const CHAR_TABLE_0 = [
    null, '',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '?', '-', '/', '!'
];
/**
 * Inverse of Character Table #0.
 * @type {Array}
 */
const INV_CHAR_TABLE_0 = CHAR_TABLE_0.reduce((map, char, i) => {
    map[char] = i;
    return map;
}, {});

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
 * @param  {Number} value - Unsigned integer
 * @param  {Type} type - Type in the puzzle format's type system
 * @return {Any}
 */
export const castValue = (type, value) => {
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
 * @param  {Any} value
 * @param  {Type} type
 * @return {Number}
 */
export const serializeValue = (type, value) => {
    switch (type) {
        case TYPE_UINT:
            return value;
        case TYPE_BOOL:
            return +value;
        case TYPE_TS:
            return ~~(+value / 1000);
        case TYPE_CT0:
            if (!INV_CHAR_TABLE_0.hasOwnProperty(value)) {
                throw new Error(`Can't encoded value ${value} as CT0`);
            }
            return INV_CHAR_TABLE_0[value];
        default:
            throw new TypeError(`Unknown type: ${type}`);
    }
};
