/* global chai */
/* eslint-env mocha */
import { FixedLengthWordIndex } from './FixedLengthWordIndex';


describe('FixedLengthWordIndex', () => {

    describe('[[constructor]]', () => {
        it('sets initial state', () => {
            const flwi = new FixedLengthWordIndex(5);
            chai.expect(flwi._wordsBuffer).to.eql([]);
            chai.expect(flwi._cardinality).to.eql(5);
            chai.expect(flwi._allWords).to.eql(new Set());
            chai.expect(flwi._allWildPattern).to.equal('*****');
        });
        it('is an error to construct without a cardinality', () => {
            chai.expect(() => new FixedLengthWordIndex()).to.throw();
        });
    });

    describe('#add', () => {
        it('adds words to buffer', () => {
            const flwi = new FixedLengthWordIndex(3);
            flwi.add('foo');
            chai.expect(flwi._wordsBuffer).to.eql(['foo']);
        });
        it('is an error to add a word of a different length', () => {
            const flwi = new FixedLengthWordIndex(4);
            chai.expect(() => flwi.add('foo')).to.throw();
        });
        it('does not commit words to trie', () => {
            const flwi = new FixedLengthWordIndex(3);
            flwi.add('foo');
            chai.expect(flwi._trie.test('foo')).to.be.false;
        });
    });

    describe('#commit', () => {
        it('commits words in buffer to trie', () => {
            const flwi = new FixedLengthWordIndex(3);
            flwi.add('foo');
            flwi.add('bar');
            flwi.add('baz');
            flwi.commit();
            chai.expect(flwi._trie.test('foo')).to.be.true;
            chai.expect(flwi._trie.test('bar')).to.be.true;
            chai.expect(flwi._trie.test('baz')).to.be.true;
        });
        it('also tracks all words ever entered in trie', () => {
            const flwi = new FixedLengthWordIndex(3);
            flwi.add('foo');
            flwi.add('bar');
            flwi.add('baz');
            flwi.commit();
            chai.expect(flwi._allWords).to.eql(new Set(['foo', 'bar', 'baz']));
        });
    });

    describe('#match', () => {
        it('returns empty array for empty trie', () => {
            const flwi = new FixedLengthWordIndex(3);
            chai.expect(flwi.match('***')).to.eql([]);
            chai.expect(flwi.match('foo')).to.eql([]);
        });
        it('returns empty array for mismatched length query', () => {
            const flwi = new FixedLengthWordIndex(3);
            chai.expect(flwi.match('*****')).to.eql([]);
        });
        it('returns exact matches for non-wildcard query', () => {
            const flwi = new FixedLengthWordIndex(3);
            flwi.add('foo');
            flwi.add('bar');
            flwi.add('baz');
            flwi.commit();
            chai.expect(flwi.match('foo')).to.eql(['foo']);
            chai.expect(flwi.match('bar')).to.eql(['bar']);
            chai.expect(flwi.match('baz')).to.eql(['baz']);
            chai.expect(flwi.match('buz')).to.eql([]);
        });
        it('returns all matches for wildcard query', () => {
            const flwi = new FixedLengthWordIndex(3);
            flwi.add('foo');
            flwi.add('bar');
            flwi.add('baz');
            flwi.commit();
            chai.expect(flwi.match('***')).to.eql(['foo', 'bar', 'baz']);
            chai.expect(flwi.match('f**')).to.eql(['foo']);
            chai.expect(flwi.match('ba*')).to.eql(['bar', 'baz']);
            chai.expect(flwi.match('**z')).to.eql(['baz']);
            chai.expect(flwi.match('*a*')).to.eql(['bar', 'baz']);
        });
    });

});
