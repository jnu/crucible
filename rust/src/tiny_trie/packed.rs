use std::collections::HashMap;



// Constants unique to parsing packed tries ---------------------------------

/// Flag that indicates whether a node is the last in the level.
const LAST_MASK: u8 = 0x1;

/// Offset of the pointer field within a node.
const PTR_SHIFT: u8 = 1;



// Packed trie implementation -----------------------------------------------

/// Packed binary trie that implements test and search with wildcard and
/// prefix matching methods.
///
/// The trie is instantiated from its Base64 binary-encoded string. The
/// format is read natively; the trie is never processed in memory. This
/// keeps instantiation time effectively instantaneous, memory requirements
/// minimal, and loses almost nothing in search performance.
///
/// The trade-off from the full Trie implementation is that the trie is
/// frozen; elements cannot be added or removed.
pub struct PackedTrie<'a> {
    offset: u32,
    data: &'a str,
    // TODO(jnu) optimized hashmap for short char keys
    table: HashMap<char, u32>,
    // TODO(jnu) could use array here? but knowing size at compile time impossible.
    inverse_table: HashMap<u32, char>,
    word_width: u32,
    pointer_mask: u32,
    char_mask: u32,
    char_shift: u32,
}

impl<'a> PackedTrie<'a> {

    /// Load a packed trie from its Base64 binary encoding.
    pub fn from(packed: &'a str) -> PackedTrie {
        let mut ptr: u32 = 0;
        ptr += 1;

        PackedTrie {
            offset: ptr,
            data: packed,
            table: HashMap::new(),
            inverse_table: HashMap::new(),
            word_width: 0,
            pointer_mask: 0,
            char_mask: 0,
            char_shift: 0,
        }
    }

    /// Test string membership in a trie.
    ///
    /// Supports wildcards and prefix matching.
    pub fn test(&self, needle: &str) {
        // TODO(jnu) implement, add wildcards and prefix matching opts.
    }


    /// Find all words matching the given pattern in the trie.
    ///
    /// Supports wildcards and prefix matching.
    pub fn search(&self, needle: &str) {
        // TODO(jnu) implement, add wildcards and prefix matching opts.
    }

}



// Tests --------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use ::tiny_trie;

    // TODO write tests
//    #[test]
//    fn load_packed) {
//        assert_eq!(tiny_trie::load_packed(...), ...);
//    }
}
