export {WordListClient} from './WordListClient';
import type {WordBank} from './WordBank';

/**
 * Represent a group of wordlists.
 */
export type Wordlist = Readonly<{[k: string]: WordBank}>;
