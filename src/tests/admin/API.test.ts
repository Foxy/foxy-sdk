import type { Mock } from 'vitest';

import { API as CoreAPI } from '../../core/index.js';
import { API as AdminAPI } from '../../admin/API.js';
import type { Tokens } from '../../admin/API.js';

let fetchMock: Mock<typeof globalThis.fetch>;

beforeEach(() => {
  fetchMock = vi.spyOn(globalThis, 'fetch');
});

afterEach(() => {
  vi.restoreAllMocks();
});

const commonInit = {
  base: new URL('https://admin.foxycart.test/s/admin/'),
  clientId: 'client_358462935687323',
  clientSecret: 'gfcvbghnjmkmjnhbgvfcdvbnm',
  level: -1,
  redirectUri: 'https://integration.example.com/foxy/callback',
};

const refreshToken = '65redfghyuyjthgrhyjthrgdfghytredtyuytredrtyuy6trtyuhgfdr';
const state = '9f2c1a7e4b0d4c3e8a6f5b2d1e0c9a8b';
const scope = 'store_id_40430 store_full_access';

const sampleToken = {
  access_token: 'w8a49rbvuznxmzs39xliwfa943fda84klkvniutgh34q1fjmnfma90iu',
  expires_in: 7200,
  refresh_token: 'bsedt8wke84rt7w49tsdljfkhg8t7p475tpwrhaskjfb04t7bodrlGne',
  scope: 'store_id_40430 store_full_access',
  token_type: 'bearer',
};

const validTokens: Tokens = {
  accessToken: '290af43rwef9e83ad0d79e97738992778derwett3t08324a9fee0521',
  refreshToken,
  expiresAt: Date.now() + 3600 * 1000,
  scope: 'store_id_40430 store_full_access',
};

// Inside REFRESH_THRESHOLD of expiry, but not expired yet.
const expiringTokens: Tokens = { ...validTokens, expiresAt: Date.now() + 60 * 1000 };

const tokenResponse = (token: object = sampleToken) => new Response(JSON.stringify(token));
const isTokenCall = (call: unknown[]) => typeof call[0] === 'string' && call[0].endsWith('/token');

function callbackUrl(params: Record<string, string>): string {
  const url = new URL(commonInit.redirectUri);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.toString();
}

describe('Admin', () => {
  describe('API', () => {
    it('exposes numeric refresh threshold as static property', () => {
      expect(typeof AdminAPI.REFRESH_THRESHOLD).toBe('number');
    });

    it('exposes default base and authorization URLs as static properties', () => {
      expect(AdminAPI.BASE_URL).toBeInstanceOf(URL);
      expect(AdminAPI.AUTHORIZATION_URL.toString()).toBe('https://auth.foxy.io/authorize');
    });

    it('exposes default version as static property', () => {
      expect(AdminAPI).toHaveProperty('VERSION', '1');
    });

    it('extends core API class', () => {
      expect(new AdminAPI(commonInit)).toBeInstanceOf(CoreAPI);
    });

    it('falls back to the default base URL when none is provided', () => {
      const { base: _base, ...initWithoutBase } = commonInit;
      const api = new AdminAPI(initWithoutBase);
      expect(api.base).toEqual(AdminAPI.BASE_URL);
    });

    it('allows setting a custom base URL', () => {
      const base = new URL('https://example.com/base/');
      const api = new AdminAPI({ ...commonInit, base });
      expect(api.base).toBe(base);
    });

    it('does not expose the client credentials or tokens on the instance', () => {
      const api = new AdminAPI(commonInit);
      api.setTokens(validTokens);

      const serialized = JSON.stringify(api);
      expect(serialized).not.toContain(commonInit.clientSecret);
      expect(serialized).not.toContain(commonInit.clientId);
      expect(serialized).not.toContain(refreshToken);
      expect(serialized).not.toContain(validTokens.accessToken);
      expect(api).not.toHaveProperty('clientSecret');
      expect(api).not.toHaveProperty('refreshToken');
    });

    it('throws when constructed with an invalid admin-specific field', () => {
      const invalidInit = { ...commonInit, clientId: 0 } as unknown as ConstructorParameters<typeof AdminAPI>[0];
      expect(() => new AdminAPI(invalidInit)).toThrow(TypeError);
    });

    it('throws when constructed with an invalid shared Core.API field', () => {
      // Not checked by assertAdminAPIInit itself — caught downstream by
      // Core.API's own assertCoreAPIInit inside super().
      const invalidInit = { ...commonInit, level: 'top' } as unknown as ConstructorParameters<typeof AdminAPI>[0];
      expect(() => new AdminAPI(invalidInit)).toThrow(TypeError);
    });

    it('supports refresh_token grant in static getToken()', async () => {
      fetchMock.mockResolvedValue(tokenResponse());

      const { clientId, clientSecret } = commonInit;
      const token = await AdminAPI.getToken({ clientId, clientSecret, refreshToken });

      expect(token).toEqual(sampleToken);

      const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect(call[0]).toBe(new URL('token', AdminAPI.BASE_URL).toString());
      expect(call[1].method).toBe('POST');
      expect((call[1].headers as Headers).get('Content-Type')).toBe('application/x-www-form-urlencoded');
      expect((call[1].body as URLSearchParams).get('grant_type')).toBe('refresh_token');
      expect((call[1].body as URLSearchParams).get('refresh_token')).toBe(refreshToken);
    });

    it('supports authorization_code grant with redirect_uri in static getToken()', async () => {
      fetchMock.mockResolvedValue(tokenResponse());

      const { clientId, clientSecret, redirectUri } = commonInit;
      const token = await AdminAPI.getToken({ clientId, clientSecret, code: 'c8f1e2d3b4a5', redirectUri });

      expect(token).toEqual(sampleToken);

      const body = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as URLSearchParams;
      expect(body.get('grant_type')).toBe('authorization_code');
      expect(body.get('code')).toBe('c8f1e2d3b4a5');
      expect(body.get('redirect_uri')).toBe(redirectUri);
    });

    it('returns null on auth failure in static getToken()', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
      const { clientId, clientSecret } = commonInit;
      expect(await AdminAPI.getToken({ clientId, clientSecret, refreshToken })).toBeNull();
    });

    it('throws in static getToken(opts, true) on auth failure', async () => {
      fetchMock.mockResolvedValue(new Response('nope', { status: 500 }));
      const { clientId, clientSecret } = commonInit;
      await expect(AdminAPI.getToken({ clientId, clientSecret, refreshToken }, true)).rejects.toThrow('nope');
    });

    it('throws when static getToken() is called with incorrect arguments', async () => {
      const incorrectOpts = { clientId: 0 } as unknown as Parameters<typeof AdminAPI.getToken>[0];
      await expect(AdminAPI.getToken(incorrectOpts)).rejects.toThrow(TypeError);
    });

    it('throws when static getToken() gets a code without a redirectUri', async () => {
      const { clientId, clientSecret } = commonInit;
      const opts = { clientId, clientSecret, code: 'c8f1e2d3b4a5' } as unknown as Parameters<typeof AdminAPI.getToken>[0];
      await expect(AdminAPI.getToken(opts)).rejects.toThrow(TypeError);
    });

    describe('signIn()', () => {
      it('builds the authorization URL for the authorization code grant', () => {
        const api = new AdminAPI(commonInit);
        const url = new URL(api.signIn({ state, scope: 'store_id_40430 store_full_access', prompt: 'login' }));

        expect(url.origin + url.pathname).toBe('https://auth.foxy.io/authorize');
        expect(url.searchParams.get('response_type')).toBe('code');
        expect(url.searchParams.get('client_id')).toBe(commonInit.clientId);
        expect(url.searchParams.get('redirect_uri')).toBe(commonInit.redirectUri);
        expect(url.searchParams.get('state')).toBe(state);
        expect(url.searchParams.get('scope')).toBe('store_id_40430 store_full_access');
        expect(url.searchParams.get('prompt')).toBe('login');
        expect(url.searchParams.has('client_secret')).toBe(false);
      });

      it('leaves out prompt when not given', () => {
        const url = new URL(new AdminAPI(commonInit).signIn({ state, scope }));
        expect(url.searchParams.has('prompt')).toBe(false);
      });

      it('uses a custom authorization URL', () => {
        const authorizationUrl = new URL('https://auth.foxycart.test/authorize');
        const api = new AdminAPI({ ...commonInit, authorizationUrl });
        expect(new URL(api.signIn({ state, scope })).origin).toBe('https://auth.foxycart.test');
      });

      it('throws without a redirectUri', () => {
        const { redirectUri: _redirectUri, ...init } = commonInit;
        expect(() => new AdminAPI(init).signIn({ state, scope })).toThrow(TypeError);
      });

      it('throws on an empty state', () => {
        expect(() => new AdminAPI(commonInit).signIn({ state: '', scope })).toThrow(TypeError);
      });

      it('throws without a scope, which Foxy would deny', () => {
        const api = new AdminAPI(commonInit);
        expect(() => api.signIn({ state } as Parameters<typeof api.signIn>[0])).toThrow(TypeError);
        expect(() => api.signIn({ state, scope: ' ' })).toThrow(TypeError);
      });
    });

    describe('confirmSignIn()', () => {
      it('exchanges the code, keeps the tokens and dispatches them', async () => {
        fetchMock.mockResolvedValueOnce(tokenResponse()).mockResolvedValueOnce(new Response(null));

        const api = new AdminAPI(commonInit);
        const listener = vi.fn();
        api.addEventListener('tokens', listener);

        const before = Date.now();
        const tokens = await api.confirmSignIn(callbackUrl({ code: 'c8f1e2d3b4a5', state }), state);

        expect(tokens).toMatchObject({
          accessToken: sampleToken.access_token,
          refreshToken: sampleToken.refresh_token,
          scope: sampleToken.scope,
        });
        expect(tokens.expiresAt).toBeGreaterThanOrEqual(before + sampleToken.expires_in * 1000);

        const body = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as URLSearchParams;
        expect(body.get('code')).toBe('c8f1e2d3b4a5');
        expect(body.get('redirect_uri')).toBe(commonInit.redirectUri);

        expect(listener).toHaveBeenCalledTimes(1);
        expect((listener.mock.calls[0][0] as CustomEvent<Tokens>).detail).toEqual(tokens);

        await api.fetch(api.base.toString());
        const request = fetchMock.mock.calls[1][0] as Request;
        expect(request.headers.get('Authorization')).toBe(`Bearer ${sampleToken.access_token}`);
      });

      it('rejects a callback whose state does not match without redeeming the code', async () => {
        const api = new AdminAPI(commonInit);
        const error = await api
          .confirmSignIn(callbackUrl({ code: 'c8f1e2d3b4a5', state: 'attacker-state' }), state)
          .catch(err => err);

        expect(error).toBeInstanceOf(CoreAPI.AuthError);
        expect(error.code).toBe('UNAUTHORIZED');
        expect(fetchMock).not.toHaveBeenCalled();
      });

      it('rejects a callback with no state', async () => {
        const error = await new AdminAPI(commonInit)
          .confirmSignIn(callbackUrl({ code: 'c8f1e2d3b4a5' }), state)
          .catch(err => err);

        expect(error.code).toBe('UNAUTHORIZED');
        expect(fetchMock).not.toHaveBeenCalled();
      });

      it('rejects a callback that reports an authorization error', async () => {
        const error = await new AdminAPI(commonInit)
          .confirmSignIn(callbackUrl({ error: 'access_denied', state }), state)
          .catch(err => err);

        expect(error).toBeInstanceOf(CoreAPI.AuthError);
        expect(error.code).toBe('UNAUTHORIZED');
        expect(error.originalError.message).toContain('access_denied');
        expect(fetchMock).not.toHaveBeenCalled();
      });

      it('throws UNAUTHORIZED when the code exchange fails', async () => {
        fetchMock.mockResolvedValue(new Response('invalid_grant', { status: 400 }));

        const api = new AdminAPI(commonInit);
        const listener = vi.fn();
        api.addEventListener('tokens', listener);

        const error = await api.confirmSignIn(callbackUrl({ code: 'c8f1e2d3b4a5', state }), state).catch(err => err);

        expect(error.code).toBe('UNAUTHORIZED');
        expect(listener).not.toHaveBeenCalled();
      });

      it('throws on an empty expected state', async () => {
        const url = callbackUrl({ code: 'c8f1e2d3b4a5', state: '' });
        await expect(new AdminAPI(commonInit).confirmSignIn(url, '')).rejects.toThrow(TypeError);
      });
    });

    describe('setTokens()', () => {
      it('does not dispatch tokens', () => {
        const api = new AdminAPI(commonInit);
        const listener = vi.fn();
        api.addEventListener('tokens', listener);
        api.setTokens(validTokens);
        expect(listener).not.toHaveBeenCalled();
      });

      it('throws on invalid tokens', () => {
        const invalid = { accessToken: 42 } as unknown as Tokens;
        expect(() => new AdminAPI(commonInit).setTokens(invalid)).toThrow(TypeError);
      });
    });

    it('makes an authenticated request with the tokens set', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new AdminAPI(commonInit);
      const url = api.base.toString();

      api.setTokens(validTokens);
      await api.fetch(url);

      const request = fetchMock.mock.calls[0][0] as Request;
      expect(request.url).toBe(url);
      expect(request.headers.get('Authorization')).toBe(`Bearer ${validTokens.accessToken}`);
      expect(request.headers.get('Content-Type')).toBe('application/json');
      expect(request.headers.get('FOXY-API-VERSION')).toBe('1');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('throws UNAUTHORIZED without sending a request when there are no tokens', async () => {
      const api = new AdminAPI(commonInit);
      const error = await api.fetch(api.base.toString()).catch(err => err);

      expect(error).toBeInstanceOf(CoreAPI.AuthError);
      expect(error.code).toBe('UNAUTHORIZED');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('uses an expiring access token as is when there is no refresh token', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new AdminAPI(commonInit);
      api.setTokens({ accessToken: expiringTokens.accessToken, expiresAt: expiringTokens.expiresAt });
      await api.fetch(api.base.toString());

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const request = fetchMock.mock.calls[0][0] as Request;
      expect(request.headers.get('Authorization')).toBe(`Bearer ${expiringTokens.accessToken}`);
    });

    it('obtains an access token with only a refresh token set, and dispatches the new tokens', async () => {
      fetchMock.mockResolvedValueOnce(tokenResponse()).mockResolvedValueOnce(new Response(null));

      const api = new AdminAPI(commonInit);
      const listener = vi.fn();
      api.addEventListener('tokens', listener);
      api.setTokens({ refreshToken });

      await api.fetch(api.base.toString());

      expect(fetchMock).toHaveBeenCalledTimes(2);
      const body = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as URLSearchParams;
      expect(body.get('refresh_token')).toBe(refreshToken);

      const resourceRequest = fetchMock.mock.calls[1][0] as Request;
      expect(resourceRequest.headers.get('Authorization')).toBe(`Bearer ${sampleToken.access_token}`);

      expect(listener).toHaveBeenCalledTimes(1);
      expect((listener.mock.calls[0][0] as CustomEvent<Tokens>).detail).toMatchObject({
        accessToken: sampleToken.access_token,
        refreshToken: sampleToken.refresh_token,
      });
    });

    it('keeps the previous refresh token when the refresh response has none', async () => {
      const { refresh_token: _refresh, ...tokenWithoutRefresh } = sampleToken;
      fetchMock.mockResolvedValueOnce(tokenResponse(tokenWithoutRefresh)).mockResolvedValueOnce(new Response(null));

      const api = new AdminAPI(commonInit);
      const listener = vi.fn();
      api.addEventListener('tokens', listener);
      api.setTokens({ refreshToken });

      await api.fetch(api.base.toString());

      expect((listener.mock.calls[0][0] as CustomEvent<Tokens>).detail.refreshToken).toBe(refreshToken);
    });

    it('refreshes when the access token is about to expire', async () => {
      fetchMock.mockResolvedValueOnce(tokenResponse()).mockResolvedValueOnce(new Response(null));

      const api = new AdminAPI(commonInit);
      api.setTokens(expiringTokens);

      await api.fetch(api.base.toString());

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(isTokenCall(fetchMock.mock.calls[0])).toBe(true);
      const resourceRequest = fetchMock.mock.calls[1][0] as Request;
      expect(resourceRequest.headers.get('Authorization')).toBe(`Bearer ${sampleToken.access_token}`);
    });

    it('does not apply a refresh that finishes after setTokens() replaced the tokens', async () => {
      let resolveToken!: (response: Response) => void;
      fetchMock
        .mockReturnValueOnce(new Promise(resolve => (resolveToken = resolve)))
        .mockResolvedValue(new Response(null));

      const api = new AdminAPI(commonInit);
      const listener = vi.fn();
      api.addEventListener('tokens', listener);
      api.setTokens({ refreshToken });

      const pending = api.fetch(api.base.toString());
      await Promise.resolve();
      api.setTokens(validTokens);
      resolveToken(tokenResponse());
      await pending;

      expect(listener).not.toHaveBeenCalled();

      await api.fetch(api.base.toString());
      const lastRequest = fetchMock.mock.calls.at(-1)![0] as Request;
      expect(lastRequest.headers.get('Authorization')).toBe(`Bearer ${validTokens.accessToken}`);
    });

    it('retries once when the access token is rejected as invalid_token', async () => {
      fetchMock
        .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'invalid_token' }), { status: 401 }))
        .mockResolvedValueOnce(tokenResponse())
        .mockResolvedValueOnce(new Response(null));

      const api = new AdminAPI(commonInit);
      const url = api.base.toString();

      api.setTokens(validTokens);
      const response = await api.fetch(url);

      expect(response.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(3);

      const firstRequest = fetchMock.mock.calls[0][0] as Request;
      expect(firstRequest.headers.get('Authorization')).toBe(`Bearer ${validTokens.accessToken}`);

      const tokenCall = fetchMock.mock.calls[1] as unknown as [string, RequestInit];
      expect(tokenCall[0]).toBe(new URL('token', api.base).toString());

      const retriedRequest = fetchMock.mock.calls[2][0] as Request;
      expect(retriedRequest.headers.get('Authorization')).toBe(`Bearer ${sampleToken.access_token}`);
    });

    it('retries a bodied POST request without throwing when the access token is rejected as invalid_token', async () => {
      fetchMock
        .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'invalid_token' }), { status: 401 }))
        .mockResolvedValueOnce(tokenResponse())
        .mockResolvedValueOnce(new Response(null));

      const api = new AdminAPI(commonInit);
      const url = api.base.toString();
      const body = JSON.stringify({ name: 'Summer sale', code: 'SUMMER25' });
      const bodiedRequest = new Request(url, { method: 'POST', body });

      api.setTokens(validTokens);

      const response = await api.fetch(bodiedRequest);

      expect(response.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(3);

      const firstRequest = fetchMock.mock.calls[0][0] as Request;
      expect(firstRequest.method).toBe('POST');
      expect(firstRequest.headers.get('Authorization')).toBe(`Bearer ${validTokens.accessToken}`);
      expect(await firstRequest.clone().text()).toBe(body);

      const retriedRequest = fetchMock.mock.calls[2][0] as Request;
      expect(retriedRequest.method).toBe('POST');
      expect(retriedRequest.headers.get('Authorization')).toBe(`Bearer ${sampleToken.access_token}`);
      expect(await retriedRequest.clone().text()).toBe(body);
    });

    it('throws UNAUTHORIZED when the access token is rejected and there is no refresh token', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: 'invalid_token' }), { status: 401 }));

      const api = new AdminAPI(commonInit);
      api.setTokens({ accessToken: validTokens.accessToken });

      const error = await api.fetch(api.base.toString()).catch(err => err);

      expect(error.code).toBe('UNAUTHORIZED');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('throws Core.API.AuthError with code TOKEN_REFRESH_FAILED when refresh fails', async () => {
      fetchMock.mockResolvedValue(new Response('server error', { status: 500 }));

      const api = new AdminAPI(commonInit);
      api.setTokens({ refreshToken });
      const error = await api.fetch(api.base.toString()).catch(err => err);

      expect(error).toBeInstanceOf(CoreAPI.AuthError);
      expect(error.code).toBe('TOKEN_REFRESH_FAILED');
      expect(error.originalError).toBeInstanceOf(Error);
    });

    it('de-dupes concurrent refreshes into a single token request and event', async () => {
      const tokenUrl = new URL('token', commonInit.base).toString();
      fetchMock.mockImplementation(async input => (input === tokenUrl ? tokenResponse() : new Response(null)));

      const api = new AdminAPI(commonInit);
      const listener = vi.fn();
      api.addEventListener('tokens', listener);
      api.setTokens({ refreshToken });

      const url = api.base.toString();
      const [response1, response2] = await Promise.all([api.fetch(url), api.fetch(url)]);

      expect(response1.ok).toBe(true);
      expect(response2.ok).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(fetchMock.mock.calls.filter(isTokenCall)).toHaveLength(1);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('stops calling a listener after removeEventListener()', async () => {
      fetchMock.mockResolvedValueOnce(tokenResponse()).mockResolvedValueOnce(new Response(null));

      const api = new AdminAPI(commonInit);
      const listener = vi.fn();
      api.addEventListener('tokens', listener);
      api.removeEventListener('tokens', listener);
      api.setTokens({ refreshToken });

      await api.fetch(api.base.toString());
      expect(listener).not.toHaveBeenCalled();
    });

    it('supports Request instances in .fetch()', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new AdminAPI(commonInit);
      const url = api.base.toString();

      api.setTokens(validTokens);
      await api.fetch(new Request(url));

      const request = fetchMock.mock.calls[0][0] as Request;
      expect(request.url).toBe(url);
      expect(request.headers.get('Authorization')).toBe(`Bearer ${validTokens.accessToken}`);
    });

    it('sends a preset Authorization header as is, without tokens or a refresh', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new AdminAPI(commonInit);
      await api.fetch(api.base.toString(), {
        headers: {
          Authorization: 'Bearer preset-token',
          'Content-Type': 'text/plain',
          'FOXY-API-VERSION': '2',
        },
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const request = fetchMock.mock.calls[0][0] as Request;
      expect(request.headers.get('Authorization')).toBe('Bearer preset-token');
      expect(request.headers.get('Content-Type')).toBe('text/plain');
      expect(request.headers.get('FOXY-API-VERSION')).toBe('2');
    });

    it('does not retry when a 401 response reports an error other than invalid_token', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: 'access_denied' }), { status: 401 }));

      const api = new AdminAPI(commonInit);
      api.setTokens(validTokens);
      const response = await api.fetch(api.base.toString());

      expect(response.status).toBe(401);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
