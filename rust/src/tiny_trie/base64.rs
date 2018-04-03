use ::phf;


include!(concat!(env!("OUT_DIR"), "/base64_const.rs"));


/// Lookup the integer value of a base64 character.
#[inline]
pub fn char_to_int<'a>(c: &'a char) -> &u32 {
    BASE64_CHAR_TO_INT.get(c).unwrap()
}

/// Lookup the base64 character value of an integer.
#[inline]
pub fn int_to_char<'a>(i: &u32) -> &'a char {
    BASE64_INT_TO_CHAR.get(i).unwrap()
}