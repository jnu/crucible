// Constants describing header fields in packed trie ------------------------

/// Character indicating terminus in a packed string.
pub const TERMINAL: char = '\0';

/// Marker to denote terminus in a trie node (i.e., non-string).
// TODO(jnu) the TS version uses an empty object sentinel, I forget why.
pub const TERMINUS: () = ();

/// Header version
pub const VERSION: u32 = 0;

/// Width of header field storing entire header width (including char table).
/// Value is given in Base64 characters (i.e., every six bits).
pub const HEADER_WIDTH_FIELD: usize = 10;

/// Width of version field
pub const VERSION_FIELD: usize = 10;

/// Width of header field representing sign of offset.
pub const OFFSET_SIGN_FIELD: usize = 1;

/// Width of header field representing unsigned value of offset.
pub const OFFSET_VAL_FIELD: usize = 21;

/// Width of header field representing the width of the char index in a word.
pub const CHAR_WIDTH_FIELD: usize = 8;

/// Width of header field representing the width of the offset pointer in a word.
pub const POINTER_WIDTH_FIELD: usize = 8;


// Constants for hard-coded body fields -------------------------------------

/// Flag that indicates whether a node is the last in the level.
pub const LAST_MASK: u32 = 0x1;

/// Offset of the pointer field within a node.
pub const PTR_SHIFT: u32 = 1;