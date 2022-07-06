// Auto-generated module loader. Do not edit.

import {chunks} from './manifest.2022-07-06T20:05:13.373Z';

/**
 * Timestamp (ms) when wordlist was last updated.
 * @type number
 */
export {ts} from './manifest.2022-07-06T20:05:13.373Z';

/**
 * ID of wordlist.
 * @type {string}
 */
export const id = 'nyt16Year';

/**
 * Get a promise resolving with packed wordlist DAWG, binned by word length.
 * @returns Promise<{[key: number]: string}>
 */
export const load = () =>
  Promise.all(
    Object.keys(chunks).map((key) =>
      chunks[key].then((mod) => [key, mod.default]),
    ),
  ).then((pairs) =>
    pairs.reduce((agg, [key, dawg]) => {
      agg[key] = dawg;
      return agg;
    }, {}),
  );
