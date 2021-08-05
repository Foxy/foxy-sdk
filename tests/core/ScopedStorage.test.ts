import { MemoryStorage } from '../../src/core/MemoryStorage';
import { ScopedStorage } from '../../src/core/ScopedStorage';

describe('Core', () => {
  describe('ScopedStorage', () => {
    it('returns the name of the nth scoped key in the list from storage.key(n)', () => {
      const target = new MemoryStorage();
      const storage = new ScopedStorage({ scope: 'foxy', target });

      target.setItem('foxy.foo', '0');
      target.setItem('acme.bar', '1');
      target.setItem('foxy.baz', '2');
      target.setItem('acme.qux', '3');

      expect(storage.key(0)).toEqual('foo');
      expect(storage.key(1)).toEqual('baz');
    });

    it("returns null if storage.key(n) doesn't exist", () => {
      const target = new MemoryStorage();
      const storage = new ScopedStorage({ scope: 'foxy', target });

      target.setItem('acme.foo', '1');
      target.setItem('acme.bar', '2');

      expect(storage.key(0)).toBeNull();
    });

    it('returns the current value associated with the given key from storage.getItem(key)', () => {
      const target = new MemoryStorage();
      const storage = new ScopedStorage({ scope: 'foxy', target });

      target.setItem('acme.foo', '0');
      target.setItem('foxy.foo', '1');
      target.setItem('foxy.bar', '2');
      target.setItem('acme.bar', '3');

      expect(storage.getItem('foo')).toEqual('1');
      expect(storage.getItem('bar')).toEqual('2');
    });

    it("returns null if storage.getItem(key) doesn't exist", () => {
      const target = new MemoryStorage();
      const storage = new ScopedStorage({ scope: 'foxy', target });

      target.setItem('acme.foo', '0');
      target.setItem('acme.bar', '1');

      expect(storage.getItem('foo')).toBeNull();
      expect(storage.getItem('bar')).toBeNull();
      expect(storage.getItem('baz')).toBeNull();
    });

    it('sets the value of the pair identified by key in storage.setItem(key, value)', () => {
      const target = new MemoryStorage();
      const storage = new ScopedStorage({ scope: 'foxy', target });

      storage.setItem('bar', '1');

      expect(target.getItem('foxy.bar')).toEqual('1');
      expect(storage.getItem('bar')).toEqual('1');
    });

    it('removes the key/value pair with the given key in storage.removeItem(key)', () => {
      const target = new MemoryStorage();
      const storage = new ScopedStorage({ scope: 'foxy', target });

      target.setItem('foxy.bar', '1');
      target.setItem('acme.bar', '2');
      storage.removeItem('bar');

      expect(target.getItem('acme.bar')).toEqual('2');
      expect(storage.getItem('foxy.bar')).toBeNull();
    });

    it('clears all entries in the scope in storage.clear()', () => {
      const target = new MemoryStorage();
      const storage = new ScopedStorage({ scope: 'foxy', target });

      target.setItem('foxy.foo', '1');
      target.setItem('foxy.bar', '2');
      target.setItem('acme.foo', '3');
      target.setItem('acme.bar', '4');

      storage.clear();

      expect(storage.getItem('foo')).toBeNull();
      expect(storage.getItem('bar')).toBeNull();

      expect(target.getItem('foxy.foo')).toBeNull();
      expect(target.getItem('foxy.bar')).toBeNull();
      expect(target.getItem('acme.foo')).toEqual('3');
      expect(target.getItem('acme.bar')).toEqual('4');
    });

    it('exposes the total number of scoped entries via storage.length', () => {
      const target = new MemoryStorage();
      const storage = new ScopedStorage({ scope: 'foxy', target });

      target.setItem('foxy.foo', '1');
      target.setItem('foxy.bar', '2');
      target.setItem('acme.foo', '3');
      target.setItem('acme.bar', '4');

      expect(storage).toHaveLength(2);
    });
  });
});
