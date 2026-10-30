import {
  assertAdminAPIInit,
  assertAdminConfirmSignInArgs,
  assertAdminGetTokenOpts,
  assertAdminSignInParams,
  assertAdminTokens,
  assertAuthErrorParams,
  assertBoolean,
  assertCoreAPIInit,
  assertCredentials,
  assertCurie,
  assertCurieChain,
  assertEmail,
  assertQuery,
  assertSignUpParams,
  assertSSOURLOptions,
  assertStoredSession,
  assertWebhookSignaturePayload,
} from '../../core/guards.js';

describe('Core', () => {
  describe('guards', () => {
    it('assertStoredSession accepts a session and rejects a broken one', () => {
      const session = { date_created: new Date().toISOString(), expires_in: 3600, jwt: 'j', session_token: 't' };
      expect(() => assertStoredSession(session)).not.toThrow();
      expect(() => assertStoredSession({ ...session, force_password_reset: true })).not.toThrow();
      expect(() => assertStoredSession(null)).toThrow('session must be');
      expect(() => assertStoredSession({ ...session, session_token: '' })).toThrow('session.session_token must be');
      expect(() => assertStoredSession({ ...session, jwt: 1 })).toThrow('session.jwt must be');
      expect(() => assertStoredSession({ ...session, expires_in: '3600' })).toThrow('session.expires_in must be');
      expect(() => assertStoredSession({ ...session, date_created: 'not a date' })).toThrow('session.date_created must be');
      expect(() => assertStoredSession({ ...session, force_password_reset: 'yes' })).toThrow(
        'session.force_password_reset must be',
      );
    });

    it('assertCoreAPIInit accepts a bare base URL', () => {
      expect(() => assertCoreAPIInit({ base: new URL('https://example.com/') })).not.toThrow();
    });

    it('assertCoreAPIInit accepts every optional member', () => {
      const init = {
        base: new URL('https://example.com/'),
        fetch: () => Promise.resolve(new Response(null)),
        level: -1,
      };

      expect(() => assertCoreAPIInit(init)).not.toThrow();
    });

    it('assertCoreAPIInit rejects the v1 bad-init fixture', () => {
      const init = { base: undefined, fetch: 123, level: 'hi' };
      expect(() => assertCoreAPIInit(init)).toThrow(TypeError);
    });

    it('assertCoreAPIInit rejects an invalid fetch on its own', () => {
      const base = new URL('https://example.com/');
      expect(() => assertCoreAPIInit({ base, fetch: 123 })).toThrow('init.fetch must be');
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

    it('assertSignUpParams accepts params with no password', () => {
      const noPassword = {
        email: 'a@b.c',
        verification: { token: 't', type: 'hcaptcha' },
      };

      expect(() => assertSignUpParams(noPassword)).not.toThrow();
    });

    it('assertEmail and assertBoolean check primitives', () => {
      expect(() => assertEmail('a@b.c')).not.toThrow();
      expect(() => assertEmail(123)).toThrow(TypeError);
      expect(() => assertBoolean(true, 'value')).not.toThrow();
      expect(() => assertBoolean('true', 'value')).toThrow(TypeError);
    });

    it('assertAdminAPIInit validates the admin-specific constructor params', () => {
      // base/level are intentionally NOT checked here: they're
      // validated downstream by Core.API's own assertCoreAPIInit inside
      // super(), so Admin's own guard only covers the fields Core doesn't
      // know about (avoids duplicating Core's validation).
      const valid = { clientId: 'a', clientSecret: 'b' };

      expect(() => assertAdminAPIInit(valid)).not.toThrow();
      expect(() => assertAdminAPIInit({ ...valid, version: '1' })).not.toThrow();
      expect(() => assertAdminAPIInit({ ...valid, redirectUri: 'https://example.com/callback' })).not.toThrow();
      expect(() => assertAdminAPIInit({ ...valid, authorizationUrl: new URL('https://example.com/authorize') })).not.toThrow();
      expect(() => assertAdminAPIInit({ clientId: 'a' })).toThrow(TypeError);
      expect(() => assertAdminAPIInit({ ...valid, clientId: 0 })).toThrow(TypeError);
      expect(() => assertAdminAPIInit({ ...valid, redirectUri: 1 })).toThrow(TypeError);
      expect(() => assertAdminAPIInit({ ...valid, authorizationUrl: 'https://example.com/authorize' })).toThrow(TypeError);
      expect(() => assertAdminAPIInit({ ...valid, version: '2' })).toThrow(TypeError);
      expect(() => assertAdminAPIInit(null)).toThrow(TypeError);
    });

    it('assertAdminGetTokenOpts requires a code with a redirect URI, or a refresh token, plus client credentials', () => {
      const base = { clientId: 'a', clientSecret: 'b' };
      const code = { code: 'x', redirectUri: 'https://example.com/callback' };

      expect(() => assertAdminGetTokenOpts({ ...base, ...code })).not.toThrow();
      expect(() => assertAdminGetTokenOpts({ ...base, refreshToken: 'x' })).not.toThrow();
      expect(() => assertAdminGetTokenOpts({ ...base, code: 'x' })).toThrow(TypeError);
      expect(() => assertAdminGetTokenOpts(base)).toThrow(TypeError);
      expect(() => assertAdminGetTokenOpts({ ...base, ...code, base: 'not-a-url' })).toThrow(TypeError);
      expect(() => assertAdminGetTokenOpts({ clientId: 'a', ...code })).toThrow(TypeError);
      expect(() => assertAdminGetTokenOpts(null)).toThrow(TypeError);
    });

    it('assertAdminTokens accepts optional tokens of the right types', () => {
      expect(() => assertAdminTokens({})).not.toThrow();
      expect(() => assertAdminTokens({ accessToken: 'a', refreshToken: 'r', expiresAt: 1792790000000, scope: 's' })).not.toThrow();
      expect(() => assertAdminTokens({ accessToken: 1 })).toThrow(TypeError);
      expect(() => assertAdminTokens({ expiresAt: '1792790000000' })).toThrow(TypeError);
      expect(() => assertAdminTokens({ expiresAt: Number.NaN })).toThrow(TypeError);
      expect(() => assertAdminTokens(null)).toThrow(TypeError);
    });

    it('assertAdminSignInParams requires a non-empty state and scope', () => {
      expect(() => assertAdminSignInParams({ state: 's', scope: 'a' })).not.toThrow();
      expect(() => assertAdminSignInParams({ state: 's', scope: 'a b', prompt: 'login' })).not.toThrow();
      expect(() => assertAdminSignInParams({ state: 's' })).toThrow(TypeError);
      expect(() => assertAdminSignInParams({ state: 's', scope: '' })).toThrow(TypeError);
      expect(() => assertAdminSignInParams({ state: '', scope: 'a' })).toThrow(TypeError);
      expect(() => assertAdminSignInParams({ state: 's', scope: ['a'] })).toThrow(TypeError);
      expect(() => assertAdminSignInParams(null)).toThrow(TypeError);
    });

    it('assertAdminConfirmSignInArgs requires a URL and a non-empty expected state', () => {
      expect(() => assertAdminConfirmSignInArgs('https://example.com/callback', 's')).not.toThrow();
      expect(() => assertAdminConfirmSignInArgs(new URL('https://example.com/callback'), 's')).not.toThrow();
      expect(() => assertAdminConfirmSignInArgs(1, 's')).toThrow(TypeError);
      expect(() => assertAdminConfirmSignInArgs('https://example.com/callback', '')).toThrow(TypeError);
    });

    it('assertSSOURLOptions enforces the required SSO fields', () => {
      const valid = { customer: 1, domain: 'https://example.com', secret: 's' };

      expect(() => assertSSOURLOptions(valid)).not.toThrow();
      expect(() => assertSSOURLOptions({ ...valid, session: 's', timestamp: 1 })).not.toThrow();
      expect(() => assertSSOURLOptions({ ...valid, customer: 'not-a-number' })).toThrow(TypeError);
      expect(() => assertSSOURLOptions({ domain: 'x', secret: 'y' })).toThrow(TypeError);
      expect(() => assertSSOURLOptions(null)).toThrow(TypeError);
    });

    it('assertWebhookSignaturePayload requires key, payload and signature strings', () => {
      const valid = { key: 'k', payload: 'p', signature: 's' };

      expect(() => assertWebhookSignaturePayload(valid)).not.toThrow();
      expect(() => assertWebhookSignaturePayload({ ...valid, key: 0 })).toThrow(TypeError);
      expect(() => assertWebhookSignaturePayload({})).toThrow(TypeError);
      expect(() => assertWebhookSignaturePayload(null)).toThrow(TypeError);
    });
  });
});
