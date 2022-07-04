/**
 * Return a shuffled shallow copy of the given array.
 * Based on https://bost.ocks.org/mike/shuffle/
 * @param {T[]} A
 * @returns {T[]}
 */
export function shuffle<T>(array: T[]) {
  const A = array.slice();
  let m = A.length;
  let t: T | null = null;
  let i: number;

  while (m) {
    i = Math.floor(Math.random() * m--);

    t = A[m];
    A[m] = A[i];
    A[i] = t;
  }

  return A;
}
