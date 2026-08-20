import { API } from '../../../core/API/API.js';
import { AuthError } from '../../../core/API/AuthError.js';
import { MemoryStorage } from '../../../core/storage.js';
import { Node } from '../../../core/API/Node.js';

describe('Core', () => {
  describe('API', () => {
    it('exposes AuthError via static property', () => {
      expect(API).toHaveProperty('AuthError', AuthError);
    });

    it('exposes Node via static property', () => {
      expect(API).toHaveProperty('Node', Node);
    });

    it('does not expose the cross-fetch polyfill statics', () => {
      expect(API).not.toHaveProperty('WHATWGResponse');
      expect(API).not.toHaveProperty('WHATWGRequest');
      expect(API).not.toHaveProperty('WHATWGHeaders');
      expect(API).not.toHaveProperty('whatwgFetch');
    });

    it('errors when constructed with incorrect params', () => {
      const incorrectInit = ({
        base: undefined,
        cache: Number,
        fetch: 123,
        level: 'hi',
        storage: null,
      } as unknown) as ConstructorParameters<typeof API>[0];

      expect(() => new API(incorrectInit)).toThrow(TypeError);
    });

    it('extends Node', () => {
      const api = new API({ base: new URL('https://example.com/') });
      expect(api).toBeInstanceOf(Node);
    });

    it('exposes base URL as instance property', () => {
      const base = new URL('https://example.com/');
      expect(new API({ base }).base).toBe(base);
    });

    it('uses custom fetch implementation when provided', async () => {
      const params = ['https://example.com/path/to/resource/', { method: 'POST' }] as const;
      const fetch = vi.fn().mockResolvedValue(new Response(null));

      await new API({ base: new URL('https://example.com/'), fetch }).fetch(...params);
      expect(fetch).toHaveBeenCalledWith(...params);
    });

    it('falls back to globalThis.fetch when none is provided', async () => {
      const params = ['https://example.com/path/to/resource/', { method: 'POST' }] as const;
      const globalFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null));

      try {
        await new API({ base: new URL('https://example.com/') }).fetch(...params);
        expect(globalFetch).toHaveBeenCalledWith(...params);
      } finally {
        globalFetch.mockRestore();
      }
    });

    it('uses MemoryStorage for cache by default', () => {
      const api = new API({ base: new URL('https://example.com/') });
      expect(api.cache).toBeInstanceOf(MemoryStorage);
    });

    it('uses custom storage implementation for cache if provided', () => {
      const cache = new MemoryStorage();
      const api = new API({ base: new URL('https://example.com/'), cache });
      expect(api.cache).toBe(cache);
    });

    it('uses MemoryStorage for storage by default', () => {
      const api = new API({ base: new URL('https://example.com/') });
      expect(api.storage).toBeInstanceOf(MemoryStorage);
    });

    it('uses custom storage implementation for storage if provided', () => {
      const storage = new MemoryStorage();
      const api = new API({ base: new URL('https://example.com/'), storage });
      expect(api.storage).toBe(storage);
    });
  });
});
