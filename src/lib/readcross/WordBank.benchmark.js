/* global suite,benchmark,WordBank,threeLetterWords,fourLetterWords,global */
global.WordBank = require('./WordBank').WordBank;
global.threeLetterWords = require('test-data/words/3letter-scrabble.json');
global.fourLetterWords = require('test-data/words/4letter-scrabble.json');


const COMMON_SETUP = {
    setup: function() {
        this.words = threeLetterWords.concat(fourLetterWords);
        this.wb = new WordBank(this.words);
    },
    teardown: function() {
        this.words = null;
        this.wb = null;
    }
};


suite('WordBank: Wildcard Search - Mid1', () => {

    benchmark('WB', function(done) {
        this.wb.search('*O**').then(done);
    });

    benchmark('RegEx', function() {
        this.words.filter(word => /^.O..$/.test(word));
    });

}, COMMON_SETUP);


suite('WordBank: Wildcard Search - Mid2', () => {

    benchmark('WB', function(done) {
        this.wb.search('*OM*').then(done);
    });

    benchmark('RegEx', function() {
        this.words.filter(word => /^.OM.$/.test(word));
    });

}, COMMON_SETUP);


suite('WordBank: Wildcard Search - End', () => {

    benchmark('WB', function(done) {
        this.wb.search('***P').then(done);
    });

    benchmark('RegEx', function() {
        this.words.filter(word => /^...P$/.test(word));
    });

}, COMMON_SETUP);
