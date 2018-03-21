/**
 * Generic interface for DAWGs. Basically, a sparse array mapping length to a base-64-encoded DAWG.
 */
export interface IDawgs {
    [key: number]: string;
}