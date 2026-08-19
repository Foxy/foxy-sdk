import {
  assertAuthErrorParams,
  assertBoolean,
  assertCoreAPIInit,
  assertCredentials,
  assertCurie,
  assertCurieChain,
  assertEmail,
  assertQuery,
  assertSignUpParams,
  assertStorage,
} from '../../core/guards.js';

import { MemoryStorage } from '../../core/storage.js';

describe('Core', () => {
  describe('guards', () => {
    it('assertStorage accepts a Web Storage implementation', () => {
      expect(() => assertStorage(new MemoryStorage(), 'storage')).not.toThrow();
    });

    it('assertStorage rejects partial implementations', () => {
      const partial = { clear: () => undefined, getItem: () => null };
      expect(() => assertStorage(partial, 'storage')).toThrow(TypeError);
      expect(() => assertStorage(null, 'storage')).toThrow(TypeError);
    });

    it('assertCoreAPIInit accepts a bare base URL', () => {
      expect(() => assertCoreAPIInit({ base: new URL('https://example.com/') })).not.toThrow();
    });

    it('assertCoreAPIInit accepts every optional member', () => {
      const init = {
        base: new URL('https://example.com/'),
        cache: new MemoryStorage(),
        fetch: () => Promise.resolve(new Response(null)),
        level: -1,
        storage: new MemoryStorage(),
      };

      expect(() => assertCoreAPIInit(init)).not.toThrow();
    });

    it('assertCoreAPIInit rejects the v1 bad-init fixture', () => {
      const init = { base: undefined, cache: Number, fetch: 123, level: 'hi', storage: null };
      expect(() => assertCoreAPIInit(init)).toThrow(TypeError);
    });

    it('assertCoreAPIInit rejects a string base', () => {
      expect(() => assertCoreAPIInit({ base: 'https://example.com/' })).toThrow(TypeError);
    });

    it('assertCoreAPIInit rejects a non-integer level', () => {
      expect(() => assertCoreAPIInit({ base: new URL('https://example.com/'), level: 1.5 })).toThrow(TypeError);
    });

    it('assertCurieChain accepts a URL followed by curies', () => {
      expect(() => assertCurieChain([new URL('https://example.com/'), 'fx:store'])).not.toThrow();
    });

    it('assertCurieChain rejects chains that do not start with a URL', () => {
      expect(() => assertCurieChain(['https://example.com/'])).toThrow(TypeError);
      expect(() => assertCurieChain([new URL('https://example.com/'), 123])).toThrow(TypeError);
      expect(() => assertCurieChain([])).toThrow(TypeError);
    });

    it('assertCurie requires a string', () => {
      expect(() => assertCurie('fx:store')).not.toThrow();
      expect(() => assertCurie(123)).toThrow(TypeError);
    });

    it('assertQuery accepts undefined and well-formed queries', () => {
      expect(() => assertQuery(undefined)).not.toThrow();
      expect(() => assertQuery({ fields: ['a'], filters: ['b=c'], limit: 1, offset: 2 })).not.toThrow();
      expect(() => assertQuery({ order: 'date_created', zoom: ['items'] })).not.toThrow();
      expect(() => assertQuery({ order: { date_created: 'asc' }, zoom: { items: 'item_options' } })).not.toThrow();
    });

    it('assertQuery rejects malformed queries', () => {
      expect(() => assertQuery({ fields: 'a' })).toThrow(TypeError);
      expect(() => assertQuery({ filters: [1] })).toThrow(TypeError);
      expect(() => assertQuery({ limit: 'ten' })).toThrow(TypeError);
      expect(() => assertQuery({ zoom: 123 })).toThrow(TypeError);
    });

    it('assertAuthErrorParams accepts every documented code', () => {
      for (const code of [
        'NEW_PASSWORD_REQUIRED',
        'INVALID_NEW_PASSWORD',
        'UNAUTHORIZED',
        'INVALID_FORM',
        'UNAVAILABLE',
        'UNKNOWN',
      ]) {
        expect(() => assertAuthErrorParams({ code })).not.toThrow();
      }
    });

    it('assertAuthErrorParams rejects unknown codes', () => {
      expect(() => assertAuthErrorParams({ code: 'NOPE' })).toThrow(TypeError);
      expect(() => assertAuthErrorParams({})).toThrow(TypeError);
    });

    it('assertCredentials requires email and password', () => {
      expect(() => assertCredentials({ email: 'a@b.c', password: 'x' })).not.toThrow();
      expect(() => assertCredentials({ email: 'a@b.c', password: 'x', newPassword: 'y' })).not.toThrow();
      expect(() => assertCredentials({ email: 'a@b.c' })).toThrow(TypeError);
      expect(() => assertCredentials({ password: 'x' })).toThrow(TypeError);
      expect(() => assertCredentials({ email: 'a@b.c', password: 'x', newPassword: 1 })).toThrow(TypeError);
    });

    it('assertSignUpParams enforces the documented shape and limits', () => {
      const valid = {
        email: 'a@b.c',
        first_name: 'A',
        last_name: 'B',
        password: 'x',
        verification: { token: 't', type: 'hcaptcha' },
      };

      expect(() => assertSignUpParams(valid)).not.toThrow();
      expect(() => assertSignUpParams({ ...valid, verification: { token: 't', type: 'recaptcha' } })).toThrow(
        TypeError,
      );
      expect(() => assertSignUpParams({ ...valid, email: 'a'.repeat(101) })).toThrow(TypeError);
      expect(() => assertSignUpParams({ ...valid, first_name: 'a'.repeat(51) })).toThrow(TypeError);
      expect(() => assertSignUpParams({ ...valid, password: 'a'.repeat(51) })).toThrow(TypeError);
      expect(() => assertSignUpParams({ verification: { token: 't', type: 'hcaptcha' } })).toThrow(TypeError);
    });

    it('assertEmail and assertBoolean check primitives', () => {
      expect(() => assertEmail('a@b.c')).not.toThrow();
      expect(() => assertEmail(123)).toThrow(TypeError);
      expect(() => assertBoolean(true, 'value')).not.toThrow();
      expect(() => assertBoolean('true', 'value')).toThrow(TypeError);
    });
  });
});
