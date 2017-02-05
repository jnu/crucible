import { PackedTrie } from 'tiny-trie';


export class FixedLengthPackedWordIndex extends AbstractFixedLengthWordIndex {

    constructor(cardinality) {
        if (cardinality === undefined) {
            throw new Error('Index must be constructed with a cardinality')
        }
    }

}
