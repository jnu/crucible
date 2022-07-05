import type {Wordlist} from '../readcross';
import type {WordQuery, Crossing} from './types';

/**
 * Search all word lists for the given query. The query consists of a word and
 * all the crossings of this word.
 */
export const searchWordLists = async (lists: Wordlist, query: WordQuery) => {
  if (!query.word) {
    return [];
  }

  // TODO One-level-deep crossing queries are sort of helpful, but a little
  // confusing to work with. Do we have to validate multiple levels?
  const allLists = Object.values(lists);
  const searchAll = (word: string) =>
    !word
      ? Promise.resolve([])
      : Promise.all(allLists.map((list) => list.search(word)))
          // TODO may want to include source metadata. For now, just glom all
          // results together no matter which list they came from.
          .then((words) => words.reduce((agg, list) => agg.concat(list), []));

  const {word, crosses} = query;
  // Fetch all sets of all possible words at crossings
  const crossesPromise = Promise.all(
    crosses.map(({crossing}) => searchAll(crossing)),
  )
    // Create a Set of acceptable chars for each crossing
    .then((crossMatches) => {
      return crossMatches.map((matches, i) => {
        const {crossIdx} = crosses[i];

        // Count how many words in the crossing match each hypothetical letter.
        // The more words, the better -- float those suggestions to the top.
        return matches.reduce((chars, match) => {
          const c = match[crossIdx];
          chars.set(c, (chars.get(c) || 0) + 1);
          return chars;
        }, new Map());
      });
    });

  // Fetch possible words for highlighted query, then partition into words
  // that are validated at all crossings and words that are not.
  const [naiveMatches, charsAtCrossings] = await Promise.all([
    searchAll(word),
    crossesPromise,
  ]);

  // Augment naive matches with info from cross-searches.
  const matchMap = naiveMatches.map((match) => {
    let score = 0;

    const hits = new Array(match.length);
    const misses = new Array(match.length);

    for (let i = 0; i < match.length; i++) {
      // Mark which letters come from the actual word
      hits[i] = match[i] === word[i];

      // Mark characters that pose problematic crossings.
      const crossingCount = charsAtCrossings[i].get(match[i]) || 0;
      misses[i] = crossingCount === 0;
      // Penalize misses pretty heavily when computing the score. But remember
      // that maybe it's the *other* fill that's the issue.
      score += crossingCount === 0 ? -1000 : crossingCount;
    }

    return {
      match,
      score,
      hits,
      misses,
    };
  });

  // Sort results by match score, then alphabetically.
  return matchMap.sort((a, b) => {
    return a.score > b.score
      ? -1
      : a.score === b.score
      ? a.match < b.match
        ? -1
        : 1
      : 1;
  });
};
