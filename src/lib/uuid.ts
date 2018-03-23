/**
 * UUIDv4 implementation based on https://gist.github.com/jed/982883
 */


// Generate random hex digits for UUIDv4.
function _v4Helper(a: any) {
    return (                // a random number from 0 to 15
        a ^                 // unless digit is 8,
        Math.random()       // in which case
        * 16                // a random number from
        >> a / 4            // 8 to 11
    ).toString(16)    // in hexadecimal
}

/**
 * Generate a UUIDv4.
 * @param {string?} a - Don't call with this argument
 * @returns {string}
 */
export function v4() {
    return ('' +
        1e7 +                 // 10000000 +
        -1e3 +                // -1000 +
        -4e3 +                // -4000 +
        -8e3 +                // -80000000 +
        -1e11                 // -100000000000,
    ).replace(                // replacing
        /[018]/g,  // zeroes, ones, and eights with
        _v4Helper             // random hex digits
    );
}