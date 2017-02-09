/* global chai,sinon */
/* eslint-env mocha */
import { LRUCache } from './LRUCache';


describe('LRUCache', () => {
    describe('[[constructor]]', () => {
        it('creates a cache with a given size', () => {
            const cache = new LRUCache(5);
            chai.expect(cache.size).to.equal(5);
        });
        it('is an error to construct without a size', () => {
            chai.expect(() => new LRUCache()).to.throw();
        });
    });

    describe('#add', () => {
        it('adds item to empty cache', () => {
            const cache = new LRUCache(1);
            cache.add('foo');
            chai.expect(cache.has('foo')).to.be.true;
        });
        it('adds item to full cache, removing older items', () => {
            const cache = new LRUCache(1);
            cache.add('foo');
            cache.add('bar');
            chai.expect(cache.has('bar')).to.be.true;
            chai.expect(cache.has('foo')).to.be.false;
        });
        it('drops oldest used item from full cache', () => {
            const startTs = +(new Date('2017-01-01T00:00:00.000Z'));
            const clock = sinon.useFakeTimers(startTs);
            const cache = new LRUCache(3);
            cache.add('foo');
            clock.tick(100);
            cache.add('bar');
            clock.tick(100);
            cache.add('baz');
            clock.tick(100);
            cache.add('boz');
            chai.expect(cache.has('foo')).to.be.false;
            chai.expect(cache.has('bar')).to.be.true;
            chai.expect(cache.has('baz')).to.be.true;
            chai.expect(cache.has('boz')).to.be.true;
            clock.restore();
        });
        it('caches by key if a key function was provided to constructor', () => {
            const cache = new LRUCache(1, x => x.key);
            cache.add({ key: 'foo', val: 'bar' });
            chai.expect(cache.has({ key: 'foo', val: 'bar' })).to.be.true;
        });
        it('returns key', () => {
            const cache = new LRUCache(1, x => x.key);
            const key = cache.add({ key: 'foo', val: 'bar' });
            chai.expect(key).to.equal('foo');
        });
        it('does not add duplicate items', () => {
            const cache = new LRUCache(2);
            cache.add('foo');
            cache.add('bar');
            cache.add('bar');
            chai.expect(cache.has('foo')).to.be.true;
            chai.expect(cache.has('bar')).to.be.true;
        });
        it('updates timestamp when duplicate items are added', () => {
            const startTs = +(new Date('2017-01-01T00:00:00.000Z'));
            const clock = sinon.useFakeTimers(startTs);
            const cache = new LRUCache(2);
            cache.add('foo');
            clock.tick(10);
            cache.add('bar');
            clock.tick(20);
            cache.add('foo');
            clock.tick(30);
            cache.add('baz');
            chai.expect(cache.has('bar')).to.be.false;
            chai.expect(cache.has('foo')).to.be.true;
            chai.expect(cache.has('baz')).to.be.true;
            clock.restore();
        });
    });

    describe('#get', () => {
        it('gets an item from the cache', () => {
            const cache = new LRUCache(1);
            cache.add('foo');
            const item = cache.get('foo');
            chai.expect(item).to.equal('foo');
        });
        it('updates last accessed time of item', () => {
            const startTs = +(new Date('2017-01-01T00:00:00.000Z'));
            const clock = sinon.useFakeTimers(startTs);
            const cache = new LRUCache(2);
            cache.add('foo');
            clock.tick(10);
            cache.add('bar');
            clock.tick(20);
            cache.get('foo');
            clock.tick(30);
            cache.add('baz');
            chai.expect(cache.has('bar')).to.be.false;
            chai.expect(cache.has('foo')).to.be.true;
            chai.expect(cache.has('baz')).to.be.true;
            clock.restore();
        });
        it('returns undefined if item is not in cache', () => {
            const cache = new LRUCache(1);
            chai.expect(cache.get('foo')).to.be.undefined;
        });
    });

    describe('#getByKey', () => {
        it('gets an item from the cache given a key', () => {
            const cache = new LRUCache(1, x => x.key);
            cache.add({ key: 'foo', val: 'bar' });
            const item = cache.getByKey('foo');
            chai.expect(item).to.eql({ key: 'foo', val: 'bar' });
        });
        it('returns undefined if key is not in cache', () => {
            const cache = new LRUCache(1);
            chai.expect(cache.getByKey('foo')).to.be.undefined;
        });
    });

    describe('#has', () => {
        it('returns true if object is in the cache', () => {
            const cache = new LRUCache(1, x => x.key);
            cache.add({ key: 'foo', val: 'bar' });
            chai.expect(cache.has({ key: 'foo', val: 'bar' })).to.be.true;
        });
        it('returns true if item is in cache when there is no key function', () => {
            const cache = new LRUCache(1);
            cache.add('bar');
            chai.expect(cache.has('bar')).to.be.true;
        });
        it('returns false when key is not in cache', () => {
            const cache = new LRUCache(1);
            cache.add('foo');
            chai.expect(cache.has('bar')).to.be.false;
        });
    });

    describe('#hasKey', () => {
        it('returns true if object with key is in the cache', () => {
            const cache = new LRUCache(1, x => x.key);
            cache.add({ key: 'foo', val: 'bar' });
            chai.expect(cache.hasKey('foo')).to.be.true;
        });
        it('returns true if item is in cache when there is no key function', () => {
            const cache = new LRUCache(1);
            cache.add('bar');
            chai.expect(cache.hasKey('bar')).to.be.true;
        });
        it('returns false when key is not in cache', () => {
            const cache = new LRUCache(1);
            cache.add('foo');
            chai.expect(cache.hasKey('bar')).to.be.false;
        });
    });
});
