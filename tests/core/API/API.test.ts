import { API } from '../../../src/core/API/API';
import { AuthError } from '../../../src/core/API/AuthError';
import { Response as CrossFetchResponse } from 'cross-fetch';
import MemoryCache from 'fake-storage';
import { Node } from '../../../src/core/API/Node';

describe('Core', () => {
  describe('API', () => {
    it('exposes AuthError via static property', () => {
      expect(API).toHaveProperty('AuthError', AuthError);
    });

    it('exposes Node via static property', () => {
      expect(API).toHaveProperty('Node', Node);
    });

    it('errors when constructed with incorrect params', () => {
      const incorrectInit = ({
        base: undefined,
        cache: Number,
        fetch: 123,
        level: 'hi',
        storage: null,
      } as unknown) as ConstructorParameters<typeof API>[0];

      expect(() => new API(incorrectInit)).toThrow();
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
      const fetch = jest.fn().mockResolvedValue(new CrossFetchResponse(null));

      await new API({ base: new URL('https://example.com/'), fetch }).fetch(...params);
      expect(fetch).toHaveBeenCalledWith(...params);
    });

    it('uses fake-storage for cache by default', () => {
      const api = new API({ base: new URL('https://example.com/') });
      expect(api.cache).toBeInstanceOf(MemoryCache);
    });

    it('uses custom storage implementation for cache if provided', () => {
      const cache = new MemoryCache();
      const api = new API({ base: new URL('https://example.com/'), cache });
      expect(api.cache).toBe(cache);
    });

    it('uses fake-storage for storage by default', () => {
      const api = new API({ base: new URL('https://example.com/') });
      expect(api.storage).toBeInstanceOf(MemoryCache);
    });

    it('uses custom storage implementation for storage if provided', () => {
      const storage = new MemoryCache();
      const api = new API({ base: new URL('https://example.com/'), storage });
      expect(api.storage).toBe(storage);
    });
  });
});
