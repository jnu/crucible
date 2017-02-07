/* global suite,benchmark,WordBank,threeLetterWords,fourLetterWords,scrabble34DAWGs,global */
global.WordBank = require('./WordBank').WordBank;
global.threeLetterWords = require('test-data/words/3letter-scrabble.json');
global.fourLetterWords = require('test-data/words/4letter-scrabble.json');
global.scrabble34DAWGs = require('test-data/words/3-4-letter-scrabble.dawg.json');


const COMMON_SETUP = {
    setup: function() {
        this.words = threeLetterWords.concat(fourLetterWords);
        this.wb = new WordBank(this.words);
        this.packedWb = new WordBank(scrabble34DAWGs);
    },
    teardown: function() {
        this.words = null;
        this.wb = null;
        this.packedWb = null;
    }
};


suite('WordBank: Wildcard Search - Beginning', () => {

    benchmark('WB', function(done) {
        this.wb.search('BOO*').then(done);
    });

    benchmark('PackedWB', function(done) {
        this.packedWb.search('BOO*').then(done);
    });

    benchmark('RegEx', function() {
        this.words.filter(word => /^BOO.$/.test(word));
    });

}, COMMON_SETUP);


suite('WordBank: Wildcard Search - Mid1', () => {

    benchmark('WB', function(done) {
        this.wb.search('*O**').then(done);
    });

    benchmark('PackedWB', function(done) {
        this.packedWb.search('*O**').then(done);
    });

    benchmark('RegEx', function() {
        this.words.filter(word => /^.O..$/.test(word));
    });

}, COMMON_SETUP);


suite('WordBank: Wildcard Search - Mid2', () => {

    benchmark('WB', function(done) {
        this.wb.search('*OM*').then(done);
    });

    benchmark('PackedWB', function(done) {
        this.packedWb.search('*OM*').then(done);
    });

    benchmark('RegEx', function() {
        this.words.filter(word => /^.OM.$/.test(word));
    });

}, COMMON_SETUP);


suite('WordBank: Wildcard Search - End', () => {

    benchmark('WB', function(done) {
        this.wb.search('***P').then(done);
    });

    benchmark('PackedWB', function(done) {
        this.packedWb.search('***P').then(done);
    });

    benchmark('RegEx', function() {
        this.words.filter(word => /^...P$/.test(word));
    });

}, COMMON_SETUP);


suite('WordBank: Wildcard Search - All', () => {

    benchmark('WB', function(done) {
        this.wb.search('****').then(done);
    });

    benchmark('PackedWB', function(done) {
        this.packedWb.search('****').then(done);
    });

    benchmark('RegEx', function() {
        this.words.filter(word => /^.{4}$/.test(word));
    });

    benchmark('length', function() {
        this.words.filter(word => word.length === 4);
    });

}, COMMON_SETUP);
