/**
 * @file Provides a fast floor_log2 function
 */

/**
 * Fast floor(log2(x)) operation
 * @param  {Number} x
 * @return {Number}
 */
export function fast_floor_log2(x: number) {
  let n = 0;
  while ((x >>= 1)) {
    n++;
  }
  return n;
}

/**
 * Cached inverse of log10(2) for log2 calculation.
 * @type {Number}
 */
const INV_LOG2 = 1 / Math.log(2);

/**
 * Get the actual value of log2(x). Use fast_floor_log2 for optimized version.
 * @param  {Number} x
 * @return {Number}
 */
export function log2(x: number) {
  return Math.log(x) * INV_LOG2;
}
