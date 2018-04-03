extern crate bit_vec;

use std::collections::HashMap;
use ::tiny_trie::constants::{HEADER_WIDTH_FIELD};
use ::tiny_trie::base64::{char_to_int};



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
        // Read the header width from the initial field.
        let header_char_width = get_base64_field(packed,
                                                 0,
                                                 HEADER_WIDTH_FIELD);

        let mut ptr: u32 = 0;

        // Read the

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

/// Extract a window of bits from a base-64 encoded sequence.
/// TODO(jnu) evaluate perf of this against reading things from bit_vec.
/// The TS version always uses this for lack of a bitset. Presumably
/// in Rust the bitset access will be faster, but who knows.
fn get_base64_field(base64: &str, start: u32, bit_length: u32) -> u32 {
    let start_char: u32 = (start as f32 / 6.0).floor() as u32;
    let start_bit_offset: u32 = start % 6;
    let end_bit: u32 = start_bit_offset + bit_length;
    let char_len: u32 = (end_bit as f32 / 6.0).ceil() as u32;
    let mask: u32 = (0x1 << bit_length) - 1;

    let mut chunk: u32 = 0;
    for i in 0..char_len {
        chunk <<= 6;
        chunk |= char_to_int(&(base64.as_bytes()[(start_char + i) as usize] as char))
    }

    let right_pad = end_bit % 6;
    if right_pad > 0 {
        chunk >>= 6 - right_pad;
    }

    chunk & mask
}



// Tests --------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use ::tiny_trie;

    #[test]
    fn get_base64_field() {
        assert_eq!(tiny_trie::get_base64_field(String::from("foo"), 0, 8), 23);
    }
}
