/* global chai */
/* eslint-env mocha */
import { FixedLengthPackedWordIndex } from './FixedLengthPackedWordIndex';
import scrabble34Dawgs from 'test-data/words/3-4-letter-scrabble.dawg.json';


describe('FixedLengthPackedWordIndex', () => {

    describe('[[constructor]]', () => {
        it('sets initial state', () => {
            const flpwi = new FixedLengthPackedWordIndex(4, scrabble34Dawgs[4]);
            chai.expect(flpwi._cardinality).to.eql(4);
            chai.expect(flpwi._allWords).to.eql(new Set());
            chai.expect(flpwi._allWildPattern).to.equal('*****');
        });
        it('is an error to construct without a cardinality', () => {
            chai.expect(() => new FixedLengthPackedWordIndex()).to.throw();
        });
    });

    describe('#add', () => {
        it('throws an error', () => {
            const flpwi = new FixedLengthPackedWordIndex(3, scrabble34Dawgs[3]);
            chai.expect(() => flpwi.add('foo')).to.throw(
                new Error(`Can't add word to packed word index.`)
            );
        });
    });

    describe('#match', () => {
        it('returns empty array for empty trie', () => {
            const flpwi = new FixedLengthPackedWordIndex(3, scrabble34Dawgs[3]);
            chai.expect(flpwi.match('***')).to.eql([]);
            chai.expect(flpwi.match('foo')).to.eql([]);
        });
        it('returns empty array for mismatched length query', () => {
            const flpwi = new FixedLengthPackedWordIndex(3, scrabble34Dawgs[3]);
            chai.expect(flpwi.match('*****')).to.eql([]);
        });
        it('returns exact matches for non-wildcard query', () => {
            const flpwi = new FixedLengthPackedWordIndex(3, scrabble34Dawgs[3]);
            flpwi.add('foo');
            flpwi.add('bar');
            flpwi.add('baz');
            flpwi.commit();
            chai.expect(flpwi.match('foo')).to.eql(['foo']);
            chai.expect(flpwi.match('bar')).to.eql(['bar']);
            chai.expect(flpwi.match('baz')).to.eql(['baz']);
            chai.expect(flpwi.match('buz')).to.eql([]);
        });
        it('returns all matches for wildcard query', () => {
            const flpwi = new FixedLengthPackedWordIndex(3, scrabble34Dawgs[3]);
            flpwi.add('foo');
            flpwi.add('bar');
            flpwi.add('baz');
            flpwi.commit();
            chai.expect(flpwi.match('***')).to.eql(['foo', 'bar', 'baz']);
            chai.expect(flpwi.match('f**')).to.eql(['foo']);
            chai.expect(flpwi.match('ba*')).to.eql(['bar', 'baz']);
            chai.expect(flpwi.match('**z')).to.eql(['baz']);
            chai.expect(flpwi.match('*a*')).to.eql(['bar', 'baz']);
        });
    });

});
