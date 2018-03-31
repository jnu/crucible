extern crate bit_vec;

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
pub struct PackedTrie {
    offset: u32,
    data: bit_vec::BitVec,
    // TODO(jnu) optimized hashmap for short char keys
    table: HashMap<char, u32>,
    // TODO(jnu) could use array here? but knowing size at compile time impossible.
    inverse_table: HashMap<u32, char>,
    word_width: u32,
    pointer_mask: u32,
    char_mask: u32,
    char_shift: u32,
}

impl PackedTrie {

    /// Load a packed trie from its Base64 binary encoding.
    #[inline]
    pub fn from(packed: &str) -> PackedTrie {
        let mut ptr: u32 = 0;
        ptr += 1;

        // Create a bitvec that can hold all the binary data
        let data = bit_vec::BitVec::with_capacity(10); // todo

        PackedTrie {
            offset: ptr,
            data,
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
    #[inline]
    pub fn test(&self, needle: &str) {
        // TODO(jnu) implement, add wildcards and prefix matching opts.
    }


    /// Find all words matching the given pattern in the trie.
    ///
    /// Supports wildcards and prefix matching.
    #[inline]
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
