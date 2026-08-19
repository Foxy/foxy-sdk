import { MemoryStorage } from '../../core/storage.js';

describe('Core', () => {
  describe('MemoryStorage', () => {
    it('starts empty', () => {
      expect(new MemoryStorage()).toHaveLength(0);
    });

    it('stores and reads values', () => {
      const storage = new MemoryStorage();
      storage.setItem('foo', 'bar');
      expect(storage.getItem('foo')).toBe('bar');
      expect(storage).toHaveLength(1);
    });

    it('returns null for missing keys', () => {
      expect(new MemoryStorage().getItem('nope')).toBeNull();
    });

    it('coerces keys and values to strings', () => {
      const storage = new MemoryStorage();
      storage.setItem(1 as unknown as string, 2 as unknown as string);
      expect(storage.getItem('1')).toBe('2');
    });

    it('removes values', () => {
      const storage = new MemoryStorage();
      storage.setItem('foo', 'bar');
      storage.removeItem('foo');
      expect(storage.getItem('foo')).toBeNull();
      expect(storage).toHaveLength(0);
    });

    it('clears all values', () => {
      const storage = new MemoryStorage();
      storage.setItem('a', '1');
      storage.setItem('b', '2');
      storage.clear();
      expect(storage).toHaveLength(0);
    });

    it('exposes keys by index in insertion order', () => {
      const storage = new MemoryStorage();
      storage.setItem('a', '1');
      storage.setItem('b', '2');
      expect(storage.key(0)).toBe('a');
      expect(storage.key(1)).toBe('b');
      expect(storage.key(2)).toBeNull();
    });
  });
});
