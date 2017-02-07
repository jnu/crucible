/* global chai */
/* eslint-env mocha */
import { FixedLengthPackedWordIndex } from './FixedLengthPackedWordIndex';
import dummyEncoding from 'test-data/words/foobarbaz.dawg.json';
import scrabble34 from 'test-data/words/3-4-letter-scrabble.dawg.json';


describe('FixedLengthPackedWordIndex', () => {

    describe('[[constructor]]', () => {
        it('sets initial state', () => {
            const flpwi = new FixedLengthPackedWordIndex(4, dummyEncoding['bingbangboop']);
            chai.expect(flpwi._cardinality).to.eql(4);
            chai.expect(flpwi._allWords).to.eql(new Set(['bing', 'bang', 'boop']));
            chai.expect(flpwi._allWildPattern).to.equal('****');
        });
        it('is an error to construct without a cardinality', () => {
            chai.expect(() => new FixedLengthPackedWordIndex()).to.throw();
        });
        it('is an error when constructed with an empty trie', () => {
            chai.expect(() => new FixedLengthPackedWordIndex(3, '')).to.throw();
        });
    });

    describe('#add', () => {
        it('throws an error', () => {
            const flpwi = new FixedLengthPackedWordIndex(3, dummyEncoding['foobarbaz']);
            chai.expect(() => flpwi.add('foo')).to.throw(Error, /Can't add word/i);
        });
    });

    describe('#match', () => {
        it('returns empty array for mismatched length query', () => {
            const flpwi = new FixedLengthPackedWordIndex(3, dummyEncoding['foobarbaz']);
            chai.expect(flpwi.match('*****')).to.eql([]);
        });
        it('returns exact matches for non-wildcard query', () => {
            const flpwi = new FixedLengthPackedWordIndex(3, scrabble34[3]);
            chai.expect(flpwi.match('LOX')).to.eql(['LOX']);
            chai.expect(flpwi.match('JOE')).to.eql(['JOE']);
            chai.expect(flpwi.match('KEG')).to.eql(['KEG']);
            chai.expect(flpwi.match('PXQ')).to.eql([]);
        });
        it('returns all matches for wildcard query', () => {
            const flpwi = new FixedLengthPackedWordIndex(3, dummyEncoding['foobarbaz']);
            chai.expect(flpwi.match('***')).to.eql(['foo', 'bar', 'baz']);
            chai.expect(flpwi.match('f**')).to.eql(['foo']);
            chai.expect(flpwi.match('ba*')).to.eql(['bar', 'baz']);
            chai.expect(flpwi.match('**z')).to.eql(['baz']);
            chai.expect(flpwi.match('*a*')).to.eql(['bar', 'baz']);
        });
    });

});
