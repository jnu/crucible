// /* global suite,benchmark */
// global.FixedLengthWordIndex = require('./FixedLengthWordIndex').FixedLengthWordIndex;
// global.threeLetterWords = require('test-data/words/3letter-scrabble.json');


// const COMMON_SETUP = {
//     setup: function() {
//         this.words = threeLetterWords;
//         this.flwi = new FixedLengthWordIndex(3);
//         this.words.map(word => this.flwi.add(word));
//         this.flwi.commit();
//     },
//     teardown: function() {
//         this.words = [];
//     }
// };


// suite('Wildcard Search - Mid', () => {

//     benchmark('FLWI', function() {
//         this.flwi.match('*O*');
//     });

//     benchmark('RegEx', function() {
//         this.words.filter(word => /^.O.$/.test(word));
//     });

// }, COMMON_SETUP);


// suite('Wildcard Search - Start', () => {

//     benchmark('FLWI', function() {
//         this.flwi.match('F**');
//     });

//     benchmark('RegEx', function() {
//         this.words.filter(word => /^F..$/.test(word));
//     });

// }, COMMON_SETUP);


// suite('Wildcard Search - End', () => {

//     benchmark('FLWI', function() {
//         this.flwi.match('**L');
//     });

//     benchmark('RegEx', function() {
//         this.words.filter(word => /^..L$/.test(word));
//     });

// }, COMMON_SETUP);


// suite('Wildcard Search - Terminals', () => {

//     benchmark('FLWI', function() {
//         this.flwi.match('B*N');
//     });

//     benchmark('RegEx', function() {
//         this.words.filter(word => /^B.N$/.test(word));
//     });

// }, COMMON_SETUP);


// suite('Wildcard Search - Tails', () => {

//     benchmark('FLWI', function() {
//         this.flwi.match('*AN');
//     });

//     benchmark('RegEx', function() {
//         this.words.filter(word => /^.AN$/.test(word));
//     });

// }, COMMON_SETUP);


// suite('Wildcard Search - Exact', () => {

//     benchmark('FLWI', function() {
//         this.flwi.match('FAN');
//     });

//     benchmark('RegEx', function() {
//         this.words.filter(word => /^FAN$/.test(word));
//     });

//     benchmark('Exact', function() {
//         this.words.filter(word => word === 'FAN');
//     });

// }, COMMON_SETUP);
