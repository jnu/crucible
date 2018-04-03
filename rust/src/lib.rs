pub mod tiny_trie;

// phf_codegen uses `::phf` syntax, weirdly. Make phf available here.
// TODO(jnu) this feels like a hack, figure out a better way.
extern crate phf;