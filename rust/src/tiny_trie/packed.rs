extern crate bit_vec;

use std::collections::{HashMap, LinkedList};
use ::tiny_trie::constants::{CHAR_WIDTH_FIELD,
                             HEADER_WIDTH_FIELD,
                             LAST_MASK,
                             OFFSET_SIGN_FIELD,
                             OFFSET_VAL_FIELD,
                             POINTER_WIDTH_FIELD,
                             PTR_SHIFT,
                             TERMINAL,
                             VERSION,
                             VERSION_FIELD};
use ::tiny_trie::base64::{char_to_int};


// Constants ----------------------------------------------------------------

/// The standard wildcard character.
const DEFAULT_WILDCARD: &'static char = &'*';


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
    offset: i32,
    data: bit_vec::BitVec,
    sdata: String,
    // TODO(jnu) optimized hashmap for short char keys
    table: HashMap<char, u32>,
    // TODO(jnu) could use array here? but knowing size at compile time impossible.
    inverse_table: HashMap<u32, char>,
    word_width: usize,
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
        // Note: parens around -1 are significant; minus sign would otherwise be applied to result,
        // i.e. -(1^0) != (-1)^0
        let offset = (-1i32).pow(offset_sign) * (offset_val as i32);

        // Get segment widths
        let char_width = get_base64_field(header, ptr, CHAR_WIDTH_FIELD);
        ptr += CHAR_WIDTH_FIELD;
        let ptr_width = get_base64_field(header, ptr, POINTER_WIDTH_FIELD);
        ptr += POINTER_WIDTH_FIELD;

        // Derive other useful widths and masks from segment widths
        let word_width = (char_width + ptr_width + 1) as usize;
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
        let data = bit_vec_from_base64(&body);
        let sdata = String::from(body);

        PackedTrie {
            offset,
            data,
            sdata,
            table,
            inverse_table,
            word_width,
            pointer_mask,
            char_mask,
            char_shift,
        }
    }

    /// Test string membership in a trie.
    #[inline]
    pub fn test(&self, needle: &str) -> bool {
        !self.search_impl(needle, DEFAULT_WILDCARD, false, true).is_empty()
    }

    /// Find all words matching the given pattern in the trie.
    #[inline]
    pub fn search(&self, needle: &str) {
        self.search_impl(needle, DEFAULT_WILDCARD, false, false);
    }

    /// The fully-qualified search method.
    ///
    /// Implements wildcard and prefix matching.
    #[inline]
    fn search_impl(&self, needle: &str, wildcard: &char, prefix: bool, first: bool) -> LinkedList<String> {
        let mut matches: LinkedList<String> = LinkedList::new();

        // Convert the needle to a vector of chars for indexed access.
        let char_vec: Vec<char> = needle.chars().collect();

        // Initialize search queue with a pointer to the root node of the trie.
        let mut queue: LinkedList<SearchNode> = LinkedList::new();
        queue.push_front(SearchNode {
            pointer: 0,
            memo: String::from(""),
            depth: 0,
        });

        let last_depth = needle.len();

        // Do BFS over trie to pull matches
        while !queue.is_empty() {
            let node = queue.pop_front().unwrap();
            let is_last = node.depth >= last_depth;
            // Get the token to match, using a special terminal for the last.
            let token = if is_last { TERMINAL } else { char_vec[node.depth] };
            let tok_idx = if is_last { 0u32 } else { *self.table.get(&token).unwrap() };
            // This may be an explicit wildcard token, or an implicit one
            // if it's a prefix search and we're beyond the last depth.
            let is_wild = token == *wildcard || (prefix && is_last);
            let mut word_ptr = node.pointer;

            loop {
                // Exit early if token does not exist in the char table (which
                // means it can't possibly be in the trie).
                if !is_wild && !self.table.contains_key(&token) {
                    break;
                }

                // Extract the word.
                // TODO(jnu) probably can replace mult with add on each iter.
                let start_bit = word_ptr * self.word_width;
                let word = get_base64_field(&self.sdata, start_bit, self.word_width);
                let char_idx = (word >> self.char_shift) & self.char_mask;

                // Test if the word is a match.
                if is_wild || char_idx == tok_idx {
                    // Add next pointer to search queue.
                    let next_ptr = (word >> PTR_SHIFT) & self.pointer_mask;
                    // Resolve the true next character (not necessarily the same
                    // as the tok_index if this was a wildcard search).
                    let new_char = *self.inverse_table.get(&char_idx).unwrap();
                    // Stopping condition: searching last block and hit a terminal.
                    if is_last && new_char == TERMINAL {
                        // Save this match.
                        matches.push_front(node.memo.clone());
                        // Optimization: early exit if we only need first match
                        if first {
                            return matches;
                        }
                        // If we are matching a literal, break out of the
                        // inner loop now.
                        if !is_wild {
                            break;
                        }
                    }

                    // Push a new node into the search queue if it's non-terminal.
                    if new_char != TERMINAL {
                        let mut new_memo = node.memo.clone();
                        new_memo.push(new_char);
                        queue.push_back(SearchNode {
                            // XXX(jnu) there is an invariant here about the
                            // relative magnitudes of offset and next_ptr,
                            // i.e.  that |offset| < |next_ptr|. The casts are
                            // a little sketchy.
                            pointer: word_ptr + (self.offset + (next_ptr as i32)) as usize,
                            depth: node.depth + 1,
                            memo: new_memo,
                        })
                    }

                }

                // Handle non-matches. First, check if this was the last
                // word in the level. If so, break now.
                if word & LAST_MASK == 1 {
                    break;
                }

                // Move pointer to next word in the block for the next iteration.
                word_ptr += 1;
            }
        }

        matches
    }

}


/// BFS trie search node
struct SearchNode {
    pointer: usize,
    memo: String,
    depth: usize,
}


/// Create a bitvec with the base64-encoded binary content.
// TODO(jnu) extend bitvec with this?
fn bit_vec_from_base64(base64: &str) -> bit_vec::BitVec {
    let len: usize = 6 * base64.len();
    let mut v = bit_vec::BitVec::from_elem(len, false);
    let mut i: usize = 0;
    for c in base64.chars() {
        let num = char_to_int(&c);
        // Transfer bits to vec.
        // TODO(jnu) how does rustc optimize this loop?
        for j in 0..6 {
            v.set(i, ((num >> (5 - j)) & 0x1u32) == 0x1u32);
            i += 1;
        }
    }
    v
}


/// Construct a map from character to numeric index from the raw char table string.
fn build_char_table(raw: &str) -> HashMap<char, u32> {
    let mut tbl = HashMap::new();
    tbl.insert(TERMINAL, 0);
    let mut i: u32 = 1;
    for c in raw.chars() {
        tbl.insert(c, i);
        i += 1;
    }
    tbl
}


/// Construct a map from numeric index to character from the raw char table string.
fn build_inverse_char_table(raw: &str) -> HashMap<u32, char> {
    let mut tbl = HashMap::new();
    tbl.insert(0, TERMINAL);
    let mut i: u32 = 1;
    for c in raw.chars() {
        tbl.insert(i, c);
        i += 1;
    }
    tbl
}


/// Extract a window of bits from a base-64 encoded sequence.
// TODO(jnu) benchmark against reading things from bit_vec.
// The TS version always uses this for lack of a bitset. Presumably
// in Rust the bitset access will be faster, but who knows.
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

    // PackedTrie -----------------------------------------------------------

    // Instantiation. Tests that format was parsed correctly.
    #[test]
    fn test_init_packed_trie() {
        let pt = PackedTrie::from("BAAAAABAwIfboarzKTbjds1FDB");

        assert_eq!(pt.offset, 1);
        assert_eq!(pt.table, build_char_table("fboarz"));
        assert_eq!(pt.inverse_table, build_inverse_char_table("fboarz"));
        assert_eq!(pt.word_width, 6);
        assert_eq!(pt.pointer_mask, 0b11);
        assert_eq!(pt.char_mask, 0b111);
        assert_eq!(pt.char_shift, 3);
        assert_eq!(pt.data, bit_vec_from_base64("KTbjds1FDB"));
    }

    // Instantiation. Check version.
    #[test]
    #[should_panic]
    fn test_init_packed_trie_version_check() {
        PackedTrie::from("BD/wAABAwIfboarzKTbjds1FDB");
    }

    // Test simple search
    #[test]
    fn test_packed_trie_test() {
        let pt = PackedTrie::from("BAAAAABAwIfboarzKTbjds1FDB");

        assert_eq!(pt.test("foo"), true);
        assert_eq!(pt.test("bar"), true);
        assert_eq!(pt.test("baz"), true);
        assert_eq!(pt.test("boop"), false);
        assert_eq!(pt.test("bop"), false);
        assert_eq!(pt.test("foz"), false);
    }


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


    // bit_vec_from_base64 (process binary) ---------------------------------

    #[test]
    fn test_bit_vec_from_base64() {
        // For reference, "fo" encodes the binary:
        // 0111 1110 1000
        let test_str = String::from("fo");
        let test_bools: [bool; 12] = [
            // first word
            false,
            true,
            true,
            true,
            // second word
            true,
            true,
            true,
            false,
            // third break
            true,
            false,
            false,
            false,
        ];
        let mut test_vec = bit_vec::BitVec::from_elem(12, false);
        for (i, b) in test_bools.iter().enumerate() {
            test_vec.set(i, *b);
        }
        assert_eq!(bit_vec_from_base64(&test_str), test_vec);
    }

}
