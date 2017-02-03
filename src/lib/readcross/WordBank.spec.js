/* global chai */
/* eslint-env mocha */
import { WordBank } from './WordBank';


describe('WordBank', () => {

    describe('[[constructor]]', () => {
        it('sets initial state', () => {
            const wb = new WordBank();
            chai.expect(wb._indexes).to.eql([]);
        });
        it('initializes words array if words are given', () => {
            const wb = new WordBank(['fu', 'bar']);
            chai.expect(wb._indexes.length).to.equal(4);
        });
    });

    describe('#insert', () => {
        it('adds a single word to the appropriate index', () => {
            const wb = new WordBank();
            wb.insert('foo');
            chai.expect(wb._indexes.length).to.equal(4);
        });
        it('adds multiple words to the appropriate indexes', () => {
            const wb = new WordBank();
            wb.insert(['fu', 'bar', 'buzz']);
            chai.expect(wb._indexes.length).to.equal(5);
            wb.insert(['sixlet']);
            chai.expect(wb._indexes.length).to.equal(7);
        });
    });

    describe('#search', () => {
        it('returns empty array with empty index', done => {
            const wb = new WordBank();
            wb.search('foo').then(results => {
                chai.expect(results).to.eql([]);
                done();
            });
        });
        it('returns empty array with no matches', done => {
            const wb = new WordBank(['foo', 'bar']);
            wb.search('baz').then(results => {
                chai.expect(results).to.eql([]);
                done();
            });
        });
        it('returns array of matches with exact search', done => {
            const wb = new WordBank(['foo', 'bar']);
            wb.search('foo').then(results => {
                chai.expect(results).to.eql(['foo']);
                done();
            });
        });
        it('returns array of matches with wildcard search', done => {
            const wb = new WordBank(['a', 'fu', 'foo', 'bar', 'baz', 'buzz', 'fuzz']);
            wb.search('**zz').then(results => {
                chai.expect(results).to.eql(['buzz', 'fuzz']);
                done();
            });
        });
    });



});
