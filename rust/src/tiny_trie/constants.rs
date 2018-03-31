// Constants describing header fields in packed trie ------------------------

/// Character indicating terminus in a packed string.
const TERMINAL: char = '\0';

/// Marker to denote terminus in a trie node (i.e., non-string).
// TODO(jnu) the TS version uses an empty object sentinel, I forget why.
const TERMINUS: () = ();

/// Header version
const VERSION: u8 = 0;

/// Width of header field storing entire header width (including char table).
/// Value is given in Base64 characters (i.e., every six bits).
const HEADER_WIDTH_FIELD: u8 = 10;

/// Width of version field
const VERSION_FIELD: u8 = 10;

/// Width of header field representing sign of offset.
const OFFSET_SIGN_FIELD: u8 = 1;

/// Width of header field representing unsigned value of offset.
const OFFSET_VAL_FIELD: u8 = 21;

/// Width of header field representing the width of the char index in a word.
const CHAR_WIDTH_FIELD: u8 = 8;

/// Width of header field representing the width of the offset pointer in a word.
const POINTER_WIDTH_FIELD: u8 = 8;