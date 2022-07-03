/**
 * Test whether a value is defined (not `null` or `undefined`).
 */
export const isDefined = <T>(val: T | void | null | undefined): val is T => val !== undefined && val !== null;
