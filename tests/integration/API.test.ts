jest.mock('cross-fetch', () => ({
  Headers: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Headers,
  Request: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Request,
  Response: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Response,
  default: jest.fn(),
  fetch: jest.fn(),
}));

import { Headers, Request, Response, fetch } from 'cross-fetch';

import { API as CoreAPI } from '../../src/core/API';
import { API as IntegrationAPI } from '../../src/integration/API';
import MemoryCache from 'fake-storage';

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
  access_token: 'w8a49rbvuznxmzs39xliwfa943fda84klkvniutgh34q1fjmnfma90iubl',
  expires_in: IntegrationAPI.REFRESH_THRESHOLD * 3,
  refresh_token: '65redfghyuyjthgrhyjthrgdfghytredtyuytredrtyuy6trtyuhgfdr',
  scope: 'store',
  token_type: 'bearer',
};

const sampleStoredToken = Object.assign({}, sampleToken, {
  date_created: new Date().toISOString(),
});

describe('Integration', () => {
  describe('API', () => {
    it('exposes numeric refresh threshold as static property', () => {
      expect(IntegrationAPI).toHaveProperty('REFRESH_THRESHOLD');
      expect(typeof IntegrationAPI.REFRESH_THRESHOLD).toBe('number');
    });

    it('exposes storage key for access token as static property', () => {
      expect(IntegrationAPI).toHaveProperty('ACCESS_TOKEN');
      expect(typeof IntegrationAPI.ACCESS_TOKEN).toBe('string');
    });

    it('exposes default base url as static property', () => {
      expect(IntegrationAPI).toHaveProperty('BASE_URL');
      expect(IntegrationAPI.BASE_URL).toBeInstanceOf(URL);
    });

    it('exposes default version as static property', () => {
      expect(IntegrationAPI).toHaveProperty('VERSION');
      expect(typeof IntegrationAPI.VERSION).toBe('string');
    });

    it('errors when API.getToken() is called with incorrect arguments', async () => {
      const incorrectOpts = ({
        base: 'fax',
        cOdE: 'why',
        clientId: 0,
        client_secret: {},
        refreshToken: null,
        version: -1,
      } as unknown) as Parameters<typeof IntegrationAPI['getToken']>[0];

      await expect(() => IntegrationAPI.getToken(incorrectOpts)).rejects.toThrow();
    });

    it('returns null on auth failure in API.getToken()', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null, { status: 500 })));
      expect(await IntegrationAPI.getToken({ ...commonInit })).toBeNull();
      fetchMock.mockClear();
    });

    it('supports authorization_code grant in API.getToken()', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));

      const { clientId, clientSecret } = commonInit;
      const url = new URL('token', IntegrationAPI.BASE_URL).toString();
      const code = '1234567890';
      const token = await IntegrationAPI.getToken({ clientId, clientSecret, code });

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

      fetchMock.mockClear();
    });

    it('supports refresh_token grant in API.getToken()', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));

      const { clientId, clientSecret, refreshToken } = commonInit;
      const url = new URL('token', IntegrationAPI.BASE_URL).toString();
      const token = await IntegrationAPI.getToken({ clientId, clientSecret, refreshToken });

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

      fetchMock.mockClear();
    });

    it('supports custom version and base in API.getToken()', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));

      const { clientId, clientSecret } = commonInit;
      const version = '1';
      const base = new URL('https://api-development.foxycart.com/');
      const url = new URL('token', base).toString();
      const code = '1234567890';
      const token = await IntegrationAPI.getToken({ base, clientId, clientSecret, code, version });

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

      fetchMock.mockClear();
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
      } as unknown) as ConstructorParameters<typeof IntegrationAPI>[0];

      expect(() => new IntegrationAPI(incorrectInit)).toThrow();
    });

    it('extends core API class', () => {
      expect(new IntegrationAPI(commonInit)).toBeInstanceOf(CoreAPI);
    });

    it('stores client ID as instance.clientId', () => {
      const api = new IntegrationAPI(commonInit);
      expect(api).toHaveProperty('clientId', commonInit.clientId);
    });

    it('stores client secret as instance.clientSecret', () => {
      const api = new IntegrationAPI(commonInit);
      expect(api).toHaveProperty('clientSecret', commonInit.clientSecret);
    });

    it('stores refresh token as instance.refreshToken', () => {
      const api = new IntegrationAPI(commonInit);
      expect(api).toHaveProperty('refreshToken', commonInit.refreshToken);
    });

    it('stores version as instance.version', () => {
      const version = '1';
      const api = new IntegrationAPI({ ...commonInit, version });
      expect(api).toHaveProperty('version', version);
    });

    it('allows setting custom base URL', () => {
      const base = new URL('https://example.com/base/');
      const api = new IntegrationAPI({ ...commonInit, base });
      expect(api).toHaveProperty('base', base);
    });

    it('allows setting custom storage', () => {
      const storage = new MemoryCache();
      const api = new IntegrationAPI({ ...commonInit, storage });
      expect(api).toHaveProperty('storage', storage);
    });

    it('allows setting custom cache', () => {
      const cache = new MemoryCache();
      const api = new IntegrationAPI({ ...commonInit, cache });
      expect(api).toHaveProperty('cache', cache);
    });

    it('makes an authenticated request when a valid access token is present in the cache', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null)));

      const url = IntegrationAPI.BASE_URL.toString();
      const api = new IntegrationAPI(commonInit);

      api.storage.setItem(IntegrationAPI.ACCESS_TOKEN, JSON.stringify(sampleStoredToken));
      await api.fetch(url);

      const headers = new Headers({ ...commonHeaders, Authorization: `Bearer ${sampleToken.access_token}` });
      expect(fetchMock).toHaveBeenCalledWith(url, { headers });

      fetchMock.mockClear();
    });

    it('obtains a new access token when the stored one is outdated', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));

      const url = IntegrationAPI.BASE_URL.toString();
      const api = new IntegrationAPI(commonInit);

      api.storage.setItem(IntegrationAPI.ACCESS_TOKEN, JSON.stringify({ ...sampleStoredToken, expires_in: 0 }));
      await api.fetch(url);

      expect(fetchMock).toHaveBeenNthCalledWith(1, new URL('token', IntegrationAPI.BASE_URL.toString()).toString(), {
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
      expect(fetchMock).toHaveBeenNthCalledWith(2, url, { headers });

      fetchMock.mockClear();
    });

    it("obtains a new access token when there isn't one", async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleToken))));

      const url = IntegrationAPI.BASE_URL.toString();
      const api = new IntegrationAPI(commonInit);
      await api.fetch(url);

      expect(fetchMock).toHaveBeenNthCalledWith(1, new URL('token', IntegrationAPI.BASE_URL.toString()).toString(), {
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
      expect(fetchMock).toHaveBeenNthCalledWith(2, url, { headers });

      fetchMock.mockClear();
    });

    it('makes an unauthenticated request after a failure to obtain a new access token', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null, { status: 500 })));

      const url = IntegrationAPI.BASE_URL.toString();
      const api = new IntegrationAPI(commonInit);
      await api.fetch(url);

      expect(fetchMock).toHaveBeenNthCalledWith(1, new URL('token', IntegrationAPI.BASE_URL.toString()).toString(), {
        body: new URLSearchParams({
          client_id: api.clientId,
          client_secret: api.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: api.refreshToken,
        }),
        headers: new Headers({ ...commonHeaders, 'Content-Type': 'application/x-www-form-urlencoded' }),
        method: 'POST',
      });

      expect(fetchMock).toHaveBeenNthCalledWith(2, url, { headers: new Headers(commonHeaders) });

      fetchMock.mockClear();
    });

    it('supports complex fetch requests', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null, { status: 500 })));

      const api = new IntegrationAPI(commonInit);
      const info = new Request(IntegrationAPI.BASE_URL.toString());
      const init = { headers: { foo: 'bar' }, method: 'POST' };

      await api.fetch(info, init);

      const headers = new Headers({ ...commonHeaders, ...init.headers });
      expect(fetchMock).toHaveBeenLastCalledWith(info, { ...init, headers });

      fetchMock.mockClear();
    });
  });
});
