extern crate phf_codegen;

use std::env;
use std::fs::File;
use std::io::{BufWriter, Write};
use std::path::Path;

const CHARS: &'static str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

fn main() {
    let path = Path::new(&env::var("OUT_DIR").unwrap()).join("base64_const.rs");
    let mut file = BufWriter::new(File::create(&path).unwrap());

    // Generate maps from characters to indexes and vice versa.
    let mut ctoi = phf_codegen::Map::new();
    let mut itoc = phf_codegen::Map::new();

    let mut i: u8 = 0;
    for c in CHARS.chars() {
        let s = i.to_string();
        ctoi.entry(c, &s);
        itoc.entry(i, &format!("'{}'", &c));
        i += 1;
    }

    // Write map from characters to indexes.
    write!(&mut file, "static BASE64_CHAR_TO_INT: phf::Map<char, u32> = ").unwrap();
    ctoi.build(&mut file).unwrap();
    write!(&mut file, ";\n").unwrap();

    // Write map from indexes to characters
    write!(&mut file, "static BASE64_INT_TO_CHAR: phf::Map<u32, char> = ").unwrap();
    itoc.build(&mut file).unwrap();
    write!(&mut file, ";\n").unwrap();
}