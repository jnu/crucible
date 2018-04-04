extern crate bit_vec;

use std::collections::HashMap;
use ::tiny_trie::constants::{CHAR_WIDTH_FIELD,
                             HEADER_WIDTH_FIELD,
                             OFFSET_SIGN_FIELD,
                             POINTER_WIDTH_FIELD,
                             TERMINAL,
                             VERSION,
                             VERSION_FIELD};
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
pub struct PackedTrie<'a> {
    offset: u32,
    data: bit_vec::BitVec,
    // TODO(jnu) optimized hashmap for short char keys
    table: HashMap<&'a char, u32>,
    // TODO(jnu) could use array here? but knowing size at compile time impossible.
    inverse_table: HashMap<u32, &'a char>,
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
                                                 HEADER_WIDTH_FIELD) as usize;

        // Cut a slice for the header alone and work with this for the rest
        // of the init processing.
        let header = packed.get(..header_char_width).unwrap();
        // Start parsing header after the width field.
        let mut ptr: usize = HEADER_WIDTH_FIELD;

        // Read the version and verify it against what we know how to parse.
        // TODO(jnu) support for multiple versions if/when necessary.
        let version = get_base64_field(header, ptr, VERSION_FIELD);
        ptr += VERSION_FIELD;

        if version != VERSION {
            panic!("Invalid header version {}. Expected {}.", version, VERSION);
        }

        // Read pointer offset
        let offset_sign = get_base64_field(header, ptr, OFFSET_SIGN_FIELD);
        ptr += OFFSET_SIGN_FIELD;
        let offset_val = get_base64_field(header, ptr, OFFSET_VAL_FIELD);
        ptr += OFFSET_VAL_FIELD;
        let offset = (-1 ** offset_sign) * offset_val;

        // Get segment widths
        let char_width = get_base64_field(header, ptr, CHAR_WIDTH_FIELD);
        ptr += CHAR_WIDTH_FIELD;
        let ptr_width = get_base64_field(header, ptr, POINTER_WIDTH_FIELD);
        ptr += POINTER_WIDTH_FIELD;

        // Derive other useful widths and masks from segment widths
        let word_width = char_width + ptr_width + 1;
        let pointer_mask = (0x1 << ptr_width) - 1;
        let char_mask = (0x1 << char_width) - 1;
        let char_shift = 1 + ptr_width;

        // The rest of the header is the character table. Parse this.
        let char_tbl_start_char = (ptr as f32 / 6.0).ceil() as usize;
        let char_table = header.get(char_tbl_start_char..).unwrap();

        let table = build_char_table(&char_table);
        let inverse_table = build_inverse_char_table(&char_table);

        // Now process trie body. Restructure as a bitvec.
        // TODO(jnu) benchmark bitvec against native reads
        let body = packed.get(header_char_width..).unwrap();
        let data = load_body(&body);

        PackedTrie {
            offset,
            data,
            table,
            inverse_table,
            word_width,
            pointer_mask,
            char_mask,
            char_shift,
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


fn load_body(raw: &str) -> bit_vec::BitVec {
    let len: usize = 6 * raw.len();
    v = bit_vec::BitVec::with_capacity(len);
    for c in raw {
        let num = char_to_int(&c);
    }
    v
}


/// Construct a map from character to numeric index from the raw char table string.
fn build_char_table(raw: &str) -> HashMap<&char, u32> {
    let tbl = HashMap::new();
    tbl.insert(TERMINAL, 0);
    let mut i: u32 = 1;
    for c in raw {
        tbl.insert(c, i);
        i += 1;
    }
    tbl
}


/// Construct a map from numeric index to character from the raw char table string.
fn build_inverse_char_table(raw: &str) -> HashMap<u32, &char> {
    let tbl = HashMap::new();
    tbl.insert(0, TERMINAL);
    let mut i: u32 = 1;
    for c in raw {
        tbl.insert(i, c);
        i += 1;
    }
    tbl
}


/// Extract a window of bits from a base-64 encoded sequence.
/// TODO(jnu) benchmark against reading things from bit_vec.
/// The TS version always uses this for lack of a bitset. Presumably
/// in Rust the bitset access will be faster, but who knows.
fn get_base64_field(base64: &str, start: usize, bit_length: usize) -> u32 {
    let bytes: &[u8] = base64.as_bytes();
    let start_char: usize = (start as f32 / 6.0).floor() as usize;
    let start_bit_offset: usize = start % 6;
    let end_bit: usize = start_bit_offset + bit_length;
    let char_len: usize = (end_bit as f32 / 6.0).ceil() as usize;
    let mask: u32 = (0x1 << bit_length as u32) - 1;

    let mut chunk: u32 = 0;
    for i in 0..char_len {
        let idx: usize = start_char + i;
        chunk <<= 6;
        chunk |= char_to_int(&(bytes[idx] as char))
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
    use super::*;


    // get_base64_field (bit extraction) ------------------------------------

    // Test basic accuracy of bit window extraction
    #[test]
    fn test_get_base64_field() {
        let test_str = String::from("foo+");
        // For reference, "foo+" encodes the binary:
        // 0111 1110 1000 1010 0011 1110
        assert_eq!(get_base64_field(&test_str, 0, 4), 7);
        assert_eq!(get_base64_field(&test_str, 2, 4), 15);
        assert_eq!(get_base64_field(&test_str, 8, 8), 138);
        assert_eq!(get_base64_field(&test_str, 10, 13), 1311);
    }

    // Test panic when window size exceeds bounds
    #[test]
    #[should_panic]
    fn test_get_base64_field_bounds() {
        let test_str = String::from("foo+");
        get_base64_field(&test_str, 17, 8);
    }

    // Test panic when starts out of bounds
    #[test]
    #[should_panic]
    fn test_get_base64_field_oob_start() {
        let test_str = String::from("foo+");
        get_base64_field(&test_str, 25, 1);
    }

}
