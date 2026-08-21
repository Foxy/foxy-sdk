import type { Mock } from 'vitest';

import { API as CoreAPI } from '../../core/index.js';
import { API as AdminAPI } from '../../admin/API.js';

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
  refreshToken: '65redfghyuyjthgrhyjthrgdfghytredtyuytredrtyuy6trtyuhgfdr',
};

const sampleToken = {
  access_token: 'w8a49rbvuznxmzs39xliwfa943fda84klkvniutgh34q1fjmnfma90iu',
  expires_in: 900,
  refresh_token: 'bsedt8wke84rt7w49tsdljfkhg8t7p475tpwrhaskjfb04t7bodrlGne',
  scope: 'store',
  token_type: 'bearer',
};

const sampleStoredToken = {
  ...sampleToken,
  access_token: '290af43rwef9e83ad0d79e97738992778derwett3t08324a9fee0521',
  date_created: new Date().toISOString(),
};

const sampleStoredExpiringToken = { ...sampleStoredToken, expires_in: 0 };

describe('Admin', () => {
  describe('API', () => {
    it('exposes numeric refresh threshold as static property', () => {
      expect(AdminAPI).toHaveProperty('REFRESH_THRESHOLD');
      expect(typeof AdminAPI.REFRESH_THRESHOLD).toBe('number');
    });

    it('exposes storage key for access token as static property', () => {
      expect(AdminAPI).toHaveProperty('ACCESS_TOKEN');
      expect(typeof AdminAPI.ACCESS_TOKEN).toBe('string');
    });

    it('exposes default base url as static property', () => {
      expect(AdminAPI).toHaveProperty('BASE_URL');
      expect(AdminAPI.BASE_URL).toBeInstanceOf(URL);
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
      fetchMock.mockResolvedValue(new Response(JSON.stringify(sampleToken)));

      const { clientId, clientSecret, refreshToken } = commonInit;
      const token = await AdminAPI.getToken({ clientId, clientSecret, refreshToken });

      expect(token).toEqual(sampleToken);

      const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect(call[0]).toBe(new URL('token', AdminAPI.BASE_URL).toString());
      expect(call[1].method).toBe('POST');
      expect((call[1].headers as Headers).get('Content-Type')).toBe('application/x-www-form-urlencoded');
      expect((call[1].body as URLSearchParams).get('grant_type')).toBe('refresh_token');
      expect((call[1].body as URLSearchParams).get('refresh_token')).toBe(refreshToken);
    });

    it('supports authorization_code grant in static getToken()', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify(sampleToken)));

      const { clientId, clientSecret } = commonInit;
      const token = await AdminAPI.getToken({ clientId, clientSecret, code: '1234567890' });

      expect(token).toEqual(sampleToken);

      const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect((call[1].body as URLSearchParams).get('grant_type')).toBe('authorization_code');
      expect((call[1].body as URLSearchParams).get('code')).toBe('1234567890');
    });

    it('returns null on auth failure in static getToken()', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
      const { clientId, clientSecret, refreshToken } = commonInit;
      expect(await AdminAPI.getToken({ clientId, clientSecret, refreshToken })).toBeNull();
    });

    it('throws in static getToken(opts, true) on auth failure', async () => {
      fetchMock.mockResolvedValue(new Response('nope', { status: 500 }));
      const { clientId, clientSecret, refreshToken } = commonInit;
      await expect(AdminAPI.getToken({ clientId, clientSecret, refreshToken }, true)).rejects.toThrow('nope');
    });

    it('throws when static getToken() is called with incorrect arguments', async () => {
      const incorrectOpts = { clientId: 0 } as unknown as Parameters<typeof AdminAPI.getToken>[0];
      await expect(AdminAPI.getToken(incorrectOpts)).rejects.toThrow(TypeError);
    });

    it('makes an authenticated request when a valid access token is present in storage', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new AdminAPI(commonInit);
      const url = api.base.toString();

      api.storage.setItem(AdminAPI.ACCESS_TOKEN, JSON.stringify(sampleStoredToken));
      await api.fetch(url);

      const request = fetchMock.mock.calls[0][0] as Request;
      expect(request.url).toBe(url);
      expect(request.headers.get('Authorization')).toBe(`Bearer ${sampleStoredToken.access_token}`);
      expect(request.headers.get('Content-Type')).toBe('application/json');
      expect(request.headers.get('FOXY-API-VERSION')).toBe('1');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('obtains a new access token when none is stored', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify(sampleToken)));

      const api = new AdminAPI(commonInit);
      const url = api.base.toString();
      await api.fetch(url);

      expect(fetchMock).toHaveBeenCalledTimes(2);

      const tokenCall = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect(tokenCall[0]).toBe(new URL('token', api.base).toString());

      const resourceRequest = fetchMock.mock.calls[1][0] as Request;
      expect(resourceRequest.url).toBe(url);
      expect(resourceRequest.headers.get('Authorization')).toBe(`Bearer ${sampleToken.access_token}`);

      const stored = JSON.parse(api.storage.getItem(AdminAPI.ACCESS_TOKEN) as string);
      expect(stored.access_token).toBe(sampleToken.access_token);
    });

    it('obtains a new access token when the stored one is near expiry', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify(sampleToken)));

      const api = new AdminAPI(commonInit);
      api.storage.setItem(AdminAPI.ACCESS_TOKEN, JSON.stringify(sampleStoredExpiringToken));

      await api.fetch(api.base.toString());

      expect(fetchMock).toHaveBeenCalledTimes(2);
      const resourceRequest = fetchMock.mock.calls[1][0] as Request;
      expect(resourceRequest.headers.get('Authorization')).toBe(`Bearer ${sampleToken.access_token}`);
    });

    it('retries once when the stored token is rejected as invalid_token', async () => {
      fetchMock
        .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'invalid_token' }), { status: 401 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(sampleToken)))
        .mockResolvedValueOnce(new Response(null));

      const api = new AdminAPI(commonInit);
      const url = api.base.toString();

      api.storage.setItem(AdminAPI.ACCESS_TOKEN, JSON.stringify(sampleStoredToken));
      const response = await api.fetch(url);

      expect(response.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(3);

      const firstRequest = fetchMock.mock.calls[0][0] as Request;
      expect(firstRequest.headers.get('Authorization')).toBe(`Bearer ${sampleStoredToken.access_token}`);

      const tokenCall = fetchMock.mock.calls[1] as unknown as [string, RequestInit];
      expect(tokenCall[0]).toBe(new URL('token', api.base).toString());

      const retriedRequest = fetchMock.mock.calls[2][0] as Request;
      expect(retriedRequest.headers.get('Authorization')).toBe(`Bearer ${sampleToken.access_token}`);
    });

    it('throws Core.API.AuthError with code TOKEN_REFRESH_FAILED when refresh fails', async () => {
      fetchMock.mockResolvedValue(new Response('server error', { status: 500 }));

      const api = new AdminAPI(commonInit);
      const error = await api.fetch(api.base.toString()).catch(err => err);

      expect(error).toBeInstanceOf(CoreAPI.AuthError);
      expect(error.code).toBe('TOKEN_REFRESH_FAILED');
      expect(error.originalError).toBeInstanceOf(Error);
    });

    it('de-dupes concurrent refreshes into a single token request', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify(sampleToken)));

      const api = new AdminAPI(commonInit);
      const url = api.base.toString();

      const [response1, response2] = await Promise.all([api.fetch(url), api.fetch(url)]);

      expect(response1.ok).toBe(true);
      expect(response2.ok).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(3);

      const tokenCalls = fetchMock.mock.calls.filter(
        call => typeof call[0] === 'string' && call[0].includes('/token'),
      );
      expect(tokenCalls).toHaveLength(1);
    });

    it('supports Request instances in .fetch()', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new AdminAPI(commonInit);
      const url = api.base.toString();

      api.storage.setItem(AdminAPI.ACCESS_TOKEN, JSON.stringify(sampleStoredToken));
      await api.fetch(new Request(url));

      const request = fetchMock.mock.calls[0][0] as Request;
      expect(request.url).toBe(url);
      expect(request.headers.get('Authorization')).toBe(`Bearer ${sampleStoredToken.access_token}`);
    });

    it('does not overwrite Authorization, Content-Type or FOXY-API-VERSION headers already set on the request', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new AdminAPI(commonInit);
      const url = api.base.toString();

      api.storage.setItem(AdminAPI.ACCESS_TOKEN, JSON.stringify(sampleStoredToken));
      await api.fetch(url, {
        headers: {
          Authorization: 'Bearer preset-token',
          'Content-Type': 'text/plain',
          'FOXY-API-VERSION': '2',
        },
      });

      const request = fetchMock.mock.calls[0][0] as Request;
      expect(request.headers.get('Authorization')).toBe('Bearer preset-token');
      expect(request.headers.get('Content-Type')).toBe('text/plain');
      expect(request.headers.get('FOXY-API-VERSION')).toBe('2');
    });

    it('does not retry when a 401 response reports an error other than invalid_token', async () => {
      const unauthorized = new Response(JSON.stringify({ error: 'access_denied' }), { status: 401 });
      fetchMock.mockResolvedValue(unauthorized);

      const api = new AdminAPI(commonInit);
      const url = api.base.toString();

      api.storage.setItem(AdminAPI.ACCESS_TOKEN, JSON.stringify(sampleStoredToken));
      const response = await api.fetch(url);

      expect(response.status).toBe(401);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
