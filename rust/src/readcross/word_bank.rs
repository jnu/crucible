use ::tiny_trie::packed::{PackedTrie};


/// Structure to contain an encoded DAWG with words of a fixed length.
pub struct WordBankIndex {
    valence: usize,
    all_words: LinkedList<String>,
    all_wild_pattern: String,
    trie: PackedTrie,
}

impl WordBankIndex {
    pub fn new(valence: usize, trie_data: &str) -> WordBankIndex {
        let trie = PackedTrie::from(trie_data);
        let all_wild_pattern = String::from("*");
        let all_words = trie.search(&all_wild_pattern);
        WordBankIndex {
            valence,
            trie,
            all_wild_pattern,
            all_words,
        }
    }
}


/// The number of tries to plan for. We can reallocate to accommodate more if
/// necessary. The max standard crossword grid is 25x25, so it's unlikely we
/// will see wordlists with words longer than 25 chars.
const INIT_IDX_CAPACITY: usize = 25;


/// Structure to contain a list of words optimized for fast querying and
/// efficient storage.
pub struct WordBank {
    indexes: Vec<WordBankIndex>,
}


impl WordBank {

    /// Create an empty WordBank.
    pub fn new() -> WordBank {
        WordBank {
            indexes: Vec::with_capacity(INIT_IDX_CAPACITY),
        }
    }

    /// Add a word list for the given valence.
    ///
    /// The trie should be given in its encoded binary form. The word list
    /// should contain words of a fixed length (e.g., all 3-letter words).
    pub fn set_index(&self, valence: usize, trie_data: &str) -> &WordBank {
        let idx = WordBankIndex::new(valence, trie_data);
        // Allocate more space as necessary. The initial size of the vector
        // should be chosen so that this happens rarely (if ever).
        let cap = self.indexes.capacity();
        if valence >= cap {
            self.indexes.reserve(valence - (cap - 1));
        }
        self.indexes[valence] = idx;
        self
    }

}