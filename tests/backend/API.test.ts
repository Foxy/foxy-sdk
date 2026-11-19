jest.mock('cross-fetch', () => ({
  Headers: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Headers,
  Request: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Request,
  Response: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Response,
  default: jest.fn(),
  fetch: jest.fn(),
}));

import { Headers, Request, Response, fetch } from 'cross-fetch';
import { VisibleStorage, safeStringify } from '../utils';

import { ArgumentError } from '../../src/core/v8n';
import { API as BackendAPI } from '../../src/backend/API';
import { API as CoreAPI } from '../../src/core/API';
import MemoryCache from 'fake-storage';
import { inspect } from 'util';

const fetchMock = (fetch as unknown) as jest.MockInstance<unknown, unknown[]>;

const commonHeaders = {
  'Content-Type': 'application/json',
  'FOXY-API-VERSION': '1',
};

const commonInit = {
  clientId: 'client_358462935687323',
  clientSecret: 'gfcvbghnjmkmjnhbgvfcdvbnm',
  level: -1,
  refreshToken: '65redfghyuyjthgrhyjthrgdfghytredtyuytredrtyuy6trtyuhgfdr',
};

const sampleToken = {
  access_token: 'w8a49rbvuznxmzs39xliwfa943fda84klkvniutgh34q1fjmnfma90iu',
  expires_in: BackendAPI.REFRESH_THRESHOLD * 3,
  refresh_token: 'bsedt8wke84rt7w49tsdljfkhg8t7p475tpwrhaskjfb04t7bodrlGne',
  scope: 'store',
  token_type: 'bearer',
};

const sampleStoredToken = Object.assign({}, sampleToken, {
  access_token: '290af43rwef9e83ad0d79e97738992778derwett3t08324a9fee0521',
  date_created: new Date().toISOString(),
});

const tokenError = {
  error: 'invalid_token',
  error_description: 'The access token is invalid or expired',
};

describe('Backend', () => {
  describe('API', () => {
    beforeEach(() => fetchMock.mockClear());

    it('exposes numeric refresh threshold as static property', () => {
      expect(BackendAPI).toHaveProperty('REFRESH_THRESHOLD');
      expect(typeof BackendAPI.REFRESH_THRESHOLD).toBe('number');
    });

    it('exposes storage key for access token as static property', () => {
      expect(BackendAPI).toHaveProperty('ACCESS_TOKEN');
      expect(typeof BackendAPI.ACCESS_TOKEN).toBe('string');
    });

    it('exposes default base url as static property', () => {
      expect(BackendAPI).toHaveProperty('BASE_URL');
      expect(BackendAPI.BASE_URL).toBeInstanceOf(URL);
    });

    it('exposes default version as static property', () => {
      expect(BackendAPI).toHaveProperty('VERSION');
      expect(typeof BackendAPI.VERSION).toBe('string');
    });

    it('errors when API.getToken() is called with incorrect arguments', async () => {
      const incorrectOpts = ({
        base: 'fax',
        cOdE: 'why',
        clientId: 0,
        client_secret: {},
        refreshToken: null,
        version: -1,
      } as unknown) as Parameters<typeof BackendAPI['getToken']>[0];

      await expect(() => BackendAPI.getToken(incorrectOpts)).rejects.toThrow();
    });

    it('returns null on auth failure in API.getToken()', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null, { status: 500 })));
      expect(await BackendAPI.getToken({ ...commonInit })).toBeNull();
    });

    it('throws an error on auth failure in API.getToken(opts, true)', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null, { status: 500 })));
      await expect(BackendAPI.getToken({ ...commonInit }, true)).rejects.toThrow();
    });

    it('supports authorization_code grant in API.getToken()', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));

      const { clientId, clientSecret } = commonInit;
      const url = new URL('token', BackendAPI.BASE_URL).toString();
      const code = '1234567890';
      const token = await BackendAPI.getToken({ clientId, clientSecret, code });

      expect(token).toEqual(sampleToken);
      expect(fetchMock).toHaveBeenNthCalledWith(1, url, {
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
        }),
        headers: new Headers({ ...commonHeaders, 'Content-Type': 'application/x-www-form-urlencoded' }),
        method: 'POST',
      });
    });

    it('supports refresh_token grant in API.getToken()', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));

      const { clientId, clientSecret, refreshToken } = commonInit;
      const url = new URL('token', BackendAPI.BASE_URL).toString();
      const token = await BackendAPI.getToken({ clientId, clientSecret, refreshToken });

      expect(token).toEqual(sampleToken);
      expect(fetchMock).toHaveBeenNthCalledWith(1, url, {
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        headers: new Headers({ ...commonHeaders, 'Content-Type': 'application/x-www-form-urlencoded' }),
        method: 'POST',
      });
    });

    it('supports custom version and base in API.getToken()', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));

      const { clientId, clientSecret } = commonInit;
      const version = '1';
      const base = new URL('https://api-development.foxycart.com/');
      const url = new URL('token', base).toString();
      const code = '1234567890';
      const token = await BackendAPI.getToken({ base, clientId, clientSecret, code, version });

      expect(token).toEqual(sampleToken);
      expect(fetchMock).toHaveBeenNthCalledWith(1, url, {
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
        }),

        headers: new Headers({
          'Content-Type': 'application/x-www-form-urlencoded',
          'FOXY-API-VERSION': version,
        }),

        method: 'POST',
      });
    });

    it('errors when constructed with incorrect arguments', () => {
      const incorrectInit = ({
        base: 0,
        cache: { oh: 'no' },
        clientId: null,
        clientSecret: NaN,
        level: 'top',
        refreshToken: new Date(),
        storage: undefined,
        version: '3',
      } as unknown) as ConstructorParameters<typeof BackendAPI>[0];

      expect(() => new BackendAPI(incorrectInit)).toThrow();
    });

    it('keeps credentials out of the error when constructor params are invalid', () => {
      const init = ({ ...commonInit, level: 'error' } as unknown) as ConstructorParameters<typeof BackendAPI>[0];
      let error: unknown;

      try {
        new BackendAPI(init);
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(ArgumentError);
      expect((error as Error).message).toContain('params.level');

      const output = inspect(error, { depth: null });
      expect(output).not.toContain(commonInit.clientSecret);
      expect(output).not.toContain(commonInit.refreshToken);
      expect(output).not.toContain(commonInit.clientId);
    });

    it('keeps credentials out of the error when API.getToken() params are invalid', async () => {
      const opts = ({ ...commonInit, version: 2 } as unknown) as Parameters<typeof BackendAPI['getToken']>[0];
      const error = await BackendAPI.getToken(opts).catch(err => err);

      expect(error).toBeInstanceOf(ArgumentError);
      expect((error as Error).message).toContain('opts.version');

      const output = inspect(error, { depth: null });
      expect(output).not.toContain(commonInit.clientSecret);
      expect(output).not.toContain(commonInit.refreshToken);
    });

    it('extends core API class', () => {
      expect(new BackendAPI(commonInit)).toBeInstanceOf(CoreAPI);
    });

    it('stores client ID as instance.clientId', () => {
      const api = new BackendAPI(commonInit);
      expect(api).toHaveProperty('clientId', commonInit.clientId);
    });

    it('stores client secret as instance.clientSecret', () => {
      const api = new BackendAPI(commonInit);
      expect(api).toHaveProperty('clientSecret', commonInit.clientSecret);
    });

    it('stores refresh token as instance.refreshToken', () => {
      const api = new BackendAPI(commonInit);
      expect(api).toHaveProperty('refreshToken', commonInit.refreshToken);
    });

    it('keeps the client secret and refresh token out of inspect, JSON and Object.keys output', () => {
      const api = new BackendAPI(commonInit);
      const inspected = inspect(api, { depth: null, showHidden: false });
      const json = safeStringify(api);

      expect(inspected).not.toContain(commonInit.clientSecret);
      expect(inspected).not.toContain(commonInit.refreshToken);
      expect(json).not.toContain(commonInit.clientSecret);
      expect(json).not.toContain(commonInit.refreshToken);
      expect(Object.keys(api)).not.toContain('clientSecret');
      expect(Object.keys(api)).not.toContain('refreshToken');

      expect(api.clientSecret).toBe(commonInit.clientSecret);
      expect(api.refreshToken).toBe(commonInit.refreshToken);
      expect(api.clientId).toBe(commonInit.clientId);
    });

    it('keeps the stored access token out of inspect and JSON output', () => {
      const storage = new VisibleStorage();
      const api = new BackendAPI({ ...commonInit, storage });

      api.storage.setItem(BackendAPI.ACCESS_TOKEN, JSON.stringify(sampleStoredToken));

      expect(inspect(api, { depth: null, showHidden: false })).not.toContain(sampleStoredToken.access_token);
      expect(safeStringify(api)).not.toContain(sampleStoredToken.access_token);
      expect(Object.keys(api)).not.toContain('storage');
      expect(api.storage).toBe(storage);
    });

    it('still uses hidden credentials when fetching a new access token', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));

      const api = new BackendAPI(commonInit);
      await api.fetch(BackendAPI.BASE_URL.toString());

      const init = fetchMock.mock.calls[0][1] as { body: URLSearchParams };
      const body = new URLSearchParams(init.body.toString());
      expect(body.get('client_id')).toBe(commonInit.clientId);
      expect(body.get('client_secret')).toBe(commonInit.clientSecret);
      expect(body.get('refresh_token')).toBe(commonInit.refreshToken);
    });

    it('stores version as instance.version', () => {
      const version = '1';
      const api = new BackendAPI({ ...commonInit, version });
      expect(api).toHaveProperty('version', version);
    });

    it('allows setting custom base URL', () => {
      const base = new URL('https://example.com/base/');
      const api = new BackendAPI({ ...commonInit, base });
      expect(api).toHaveProperty('base', base);
    });

    it('allows setting custom storage', () => {
      const storage = new MemoryCache();
      const api = new BackendAPI({ ...commonInit, storage });
      expect(api).toHaveProperty('storage', storage);
    });

    it('allows setting custom cache', () => {
      const cache = new MemoryCache();
      const api = new BackendAPI({ ...commonInit, cache });
      expect(api).toHaveProperty('cache', cache);
    });

    it('makes an authenticated request when a valid access token is present in the cache', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null)));

      const url = BackendAPI.BASE_URL.toString();
      const api = new BackendAPI(commonInit);

      api.storage.setItem(BackendAPI.ACCESS_TOKEN, JSON.stringify(sampleStoredToken));
      await api.fetch(url);

      const headers = new Headers({ ...commonHeaders, Authorization: `Bearer ${sampleStoredToken.access_token}` });
      expect(fetchMock).toHaveBeenCalledWith(new Request(url, { headers }));
    });

    it('obtains a new access token when the stored one is outdated', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));

      const url = BackendAPI.BASE_URL.toString();
      const api = new BackendAPI(commonInit);

      api.storage.setItem(BackendAPI.ACCESS_TOKEN, JSON.stringify({ ...sampleStoredToken, expires_in: 0 }));
      await api.fetch(url);

      expect(fetchMock).toHaveBeenNthCalledWith(1, new URL('token', BackendAPI.BASE_URL.toString()).toString(), {
        body: new URLSearchParams({
          client_id: api.clientId,
          client_secret: api.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: api.refreshToken,
        }),
        headers: new Headers({ ...commonHeaders, 'Content-Type': 'application/x-www-form-urlencoded' }),
        method: 'POST',
      });

      const headers = new Headers({ ...commonHeaders, Authorization: `Bearer ${sampleToken.access_token}` });
      expect(fetchMock).toHaveBeenNthCalledWith(2, new Request(url, { headers }));
    });

    it("obtains a new access token when there isn't one", async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));

      const url = BackendAPI.BASE_URL.toString();
      const api = new BackendAPI(commonInit);
      await api.fetch(url);

      expect(fetchMock).toHaveBeenNthCalledWith(1, new URL('token', BackendAPI.BASE_URL.toString()).toString(), {
        body: new URLSearchParams({
          client_id: api.clientId,
          client_secret: api.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: api.refreshToken,
        }),
        headers: new Headers({ ...commonHeaders, 'Content-Type': 'application/x-www-form-urlencoded' }),
        method: 'POST',
      });

      const headers = new Headers({ ...commonHeaders, Authorization: `Bearer ${sampleToken.access_token}` });
      expect(fetchMock).toHaveBeenNthCalledWith(2, new Request(url, { headers }));
    });

    it('obtains a new access token when the stored one has been revoked', async () => {
      fetchMock
        .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify(tokenError), { status: 401 })))
        .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify(sampleToken))))
        .mockImplementationOnce(() => Promise.resolve(new Response(null)));

      const url = BackendAPI.BASE_URL.toString();
      const api = new BackendAPI(commonInit);

      api.storage.setItem(BackendAPI.ACCESS_TOKEN, JSON.stringify(sampleStoredToken));
      await api.fetch(url);

      let headers = new Headers({ ...commonHeaders, Authorization: `Bearer ${sampleStoredToken.access_token}` });
      expect(fetchMock).toHaveBeenNthCalledWith(1, new Request(url, { headers }));

      expect(fetchMock).toHaveBeenNthCalledWith(2, new URL('token', BackendAPI.BASE_URL.toString()).toString(), {
        body: new URLSearchParams({
          client_id: api.clientId,
          client_secret: api.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: api.refreshToken,
        }),
        headers: new Headers({ ...commonHeaders, 'Content-Type': 'application/x-www-form-urlencoded' }),
        method: 'POST',
      });

      headers = new Headers({ ...commonHeaders, Authorization: `Bearer ${sampleToken.access_token}` });
      expect(fetchMock).toHaveBeenNthCalledWith(3, new Request(url, { headers }));
    });

    it('makes an unauthenticated request after a failure to obtain a new access token', async () => {
      fetchMock
        .mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 500 })))
        .mockImplementationOnce(() => Promise.resolve(new Response(null)));

      const url = BackendAPI.BASE_URL.toString();
      const api = new BackendAPI(commonInit);

      await api.fetch(url);

      expect(fetchMock).toHaveBeenNthCalledWith(1, new URL('token', BackendAPI.BASE_URL.toString()).toString(), {
        body: new URLSearchParams({
          client_id: api.clientId,
          client_secret: api.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: api.refreshToken,
        }),
        headers: new Headers({ ...commonHeaders, 'Content-Type': 'application/x-www-form-urlencoded' }),
        method: 'POST',
      });

      expect(fetchMock).toHaveBeenNthCalledWith(2, new Request(url, { headers: commonHeaders }));
    });

    it('supports complex fetch requests with detailed arguments', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null, { status: 500 })));

      const api = new BackendAPI(commonInit);
      const info = BackendAPI.BASE_URL.toString();
      const init = { headers: { foo: 'bar' }, method: 'POST' };

      await api.fetch(info, init);

      const headers = new Headers({ ...commonHeaders, ...init.headers });
      expect(fetchMock).toHaveBeenLastCalledWith(new Request(info, { ...init, headers }));
    });

    it('supports complex fetch requests with Request instances', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null, { status: 500 })));

      const api = new BackendAPI(commonInit);
      const info = BackendAPI.BASE_URL.toString();
      const init = { headers: { foo: 'bar' }, method: 'POST' };

      await api.fetch(new Request(info, init));

      const headers = new Headers({ ...commonHeaders, ...init.headers });
      expect(fetchMock).toHaveBeenLastCalledWith(new Request(info, { ...init, headers }));
    });

    it('handles concurrent requests that detect an expired token without duplicate refreshes', async () => {
      const url = BackendAPI.BASE_URL.toString();
      const api = new BackendAPI(commonInit);

      // Store an expired token
      api.storage.setItem(BackendAPI.ACCESS_TOKEN, JSON.stringify({ ...sampleStoredToken, expires_in: 0 }));

      // Set up fetch to succeed after token refresh
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));

      // Make two concurrent requests that will both detect the expired token
      const [response1, response2] = await Promise.all([api.fetch(url), api.fetch(url)]);

      // Verify both requests succeed
      expect(response1.ok).toBe(true);
      expect(response2.ok).toBe(true);

      // Verify token refresh was called exactly once (for the token endpoint)
      // Expected calls: 1 token refresh + 2 actual requests = 3 total
      expect(fetchMock).toHaveBeenCalledTimes(3);

      // First call should be token refresh
      expect(fetchMock).toHaveBeenNthCalledWith(1, new URL('token', BackendAPI.BASE_URL.toString()).toString(), {
        body: new URLSearchParams({
          client_id: api.clientId,
          client_secret: api.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: api.refreshToken,
        }),
        headers: new Headers({ ...commonHeaders, 'Content-Type': 'application/x-www-form-urlencoded' }),
        method: 'POST',
      });

      // Second and third calls should be the two actual requests
      const headers = new Headers({ ...commonHeaders, Authorization: `Bearer ${sampleToken.access_token}` });
      expect(fetchMock).toHaveBeenNthCalledWith(2, new Request(url, { headers }));
      expect(fetchMock).toHaveBeenNthCalledWith(3, new Request(url, { headers }));
    });

    describe('with a custom fetch', () => {
      type Call = [string, RequestInit & { headers: Record<string, string>; body?: ArrayBuffer }];

      const tokenURL = new URL('token', BackendAPI.BASE_URL).toString();
      const decode = (body?: ArrayBuffer) => {
        const params: Record<string, string> = {};
        new URLSearchParams(Buffer.from(body as ArrayBuffer).toString()).forEach((v, k) => (params[k] = v));
        return params;
      };

      it('errors when constructed with a fetch that is not a function', () => {
        const init = ({ ...commonInit, fetch: 'nope' } as unknown) as ConstructorParameters<typeof BackendAPI>[0];
        expect(() => new BackendAPI(init)).toThrow(ArgumentError);
        expect(() => new BackendAPI(init)).toThrow('params.fetch');
      });

      it('errors when API.getToken() is called with a fetch that is not a function', async () => {
        const opts = ({ ...commonInit, fetch: {} } as unknown) as Parameters<typeof BackendAPI['getToken']>[0];
        await expect(() => BackendAPI.getToken(opts)).rejects.toThrow();
      });

      it('uses the custom fetch in API.getToken()', async () => {
        const customFetch = jest.fn(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));
        const { clientId, clientSecret, refreshToken } = commonInit;
        const token = await BackendAPI.getToken({ clientId, clientSecret, fetch: customFetch, refreshToken });

        expect(token).toEqual(sampleToken);
        expect(fetchMock).not.toHaveBeenCalled();
        expect(customFetch).toHaveBeenCalledTimes(1);

        const [url, init] = (customFetch.mock.calls[0] as unknown) as Call;
        expect(url).toBe(tokenURL);
        expect(init.method).toBe('POST');
        expect(init.headers).toMatchObject({
          'content-type': 'application/x-www-form-urlencoded',
          'foxy-api-version': '1',
        });
        expect(decode(init.body)).toEqual({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        });
      });

      it("uses the API's custom fetch when API.getToken() is given an API instance", async () => {
        const customFetch = jest.fn(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));
        const api = new BackendAPI({ ...commonInit, fetch: customFetch });

        expect(await BackendAPI.getToken(api)).toEqual(sampleToken);
        expect(fetchMock).not.toHaveBeenCalled();
        expect(customFetch).toHaveBeenCalledTimes(1);
        expect(((customFetch.mock.calls[0] as unknown) as Call)[0]).toBe(tokenURL);
      });

      it('uses the default fetch when API.getToken() is given an API instance without a custom fetch', async () => {
        fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));
        expect(await BackendAPI.getToken(new BackendAPI(commonInit))).toEqual(sampleToken);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0][0]).toBe(tokenURL);
      });

      it('sends the token request and the API request through the custom fetch', async () => {
        const customFetch = jest
          .fn()
          .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify(sampleToken))))
          .mockImplementationOnce(() => Promise.resolve(new Response('{}')));

        const api = new BackendAPI({ ...commonInit, fetch: customFetch });
        const url = BackendAPI.BASE_URL.toString();
        const response = await api.fetch(url);

        expect(response.ok).toBe(true);
        expect(fetchMock).not.toHaveBeenCalled();
        expect(customFetch).toHaveBeenCalledTimes(2);

        const calls = customFetch.mock.calls as Call[];
        expect(calls[0][0]).toBe(tokenURL);
        expect(decode(calls[0][1].body)).toHaveProperty('grant_type', 'refresh_token');
        expect(calls[1][0]).toBe(url);
        expect(calls[1][1].method).toBe('GET');
        expect(calls[1][1].headers).toEqual({
          'authorization': `Bearer ${sampleToken.access_token}`,
          'content-type': 'application/json',
          'foxy-api-version': '1',
        });
      });

      it('refreshes a revoked access token through the custom fetch', async () => {
        const customFetch = jest
          .fn()
          .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify(tokenError), { status: 401 })))
          .mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify(sampleToken))))
          .mockImplementationOnce(() => Promise.resolve(new Response('{}')));

        const api = new BackendAPI({ ...commonInit, fetch: customFetch });
        const url = BackendAPI.BASE_URL.toString();
        api.storage.setItem(BackendAPI.ACCESS_TOKEN, JSON.stringify(sampleStoredToken));

        const response = await api.fetch(url, { body: '{"foo":"bar"}', method: 'POST' });

        expect(response.ok).toBe(true);
        expect(fetchMock).not.toHaveBeenCalled();
        expect(customFetch).toHaveBeenCalledTimes(3);

        const calls = customFetch.mock.calls as Call[];
        expect(calls[0][0]).toBe(url);
        expect(calls[0][1].headers).toHaveProperty('authorization', `Bearer ${sampleStoredToken.access_token}`);
        expect(calls[1][0]).toBe(tokenURL);
        expect(calls[2][0]).toBe(url);
        expect(calls[2][1].method).toBe('POST');
        expect(calls[2][1].headers).toHaveProperty('authorization', `Bearer ${sampleToken.access_token}`);
        expect(Buffer.from(calls[2][1].body as ArrayBuffer).toString()).toBe('{"foo":"bar"}');
      });

      it('sends graph traversal requests through the custom fetch', async () => {
        const customFetch = jest.fn(() => Promise.resolve(new Response(JSON.stringify({ _links: {} }))));
        const api = new BackendAPI({ ...commonInit, fetch: customFetch });
        api.storage.setItem(BackendAPI.ACCESS_TOKEN, JSON.stringify(sampleStoredToken));

        await api.get();

        expect(fetchMock).not.toHaveBeenCalled();
        expect(customFetch).toHaveBeenCalledTimes(1);
        expect((customFetch.mock.calls[0] as unknown) as Call).toHaveProperty([0], BackendAPI.BASE_URL.toString());
      });
    });
  });
});
