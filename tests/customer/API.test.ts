jest.mock('cross-fetch', () => ({
  Headers: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Headers,
  Request: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Request,
  Response: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Response,
  default: jest.fn(),
  fetch: jest.fn(),
}));

import { Request, Response, fetch } from 'cross-fetch';

import { API as CoreAPI } from '../../src/core/API';
import { Credentials } from '../../src/customer/types';
import { API as CustomerAPI } from '../../src/customer/API';

const fetchMock = (fetch as unknown) as jest.MockInstance<unknown, unknown[]>;

const commonHeaders = {
  'Content-Type': 'application/json',
  'FOXY-API-VERSION': '1',
};

const commonInit = {
  base: new URL('https://demo.foxycart.test/s/customer/'),
  level: -1,
};

const sampleSession = {
  expires_in: 86400,
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.NQemf8P8qIf_5lPQNqstWDGnAAfhjO1rGzHNqE8Fwuw',
  session_token: '20crb85zhy2y3hgrhyjthr96c43fgh43fda84klgh34q1fjmna90iubl',
};

const sampleStoredSession = Object.assign({}, sampleSession, {
  date_created: new Date().toISOString(),
});

const sampleStoredExpiredSession = Object.assign({}, sampleSession, {
  date_created: new Date(0, 0, 1).toISOString(),
  expires_in: 0,
});

describe('Customer', () => {
  describe('API', () => {
    it('exposes storage key for session as static property', () => {
      expect(CustomerAPI).toHaveProperty('SESSION');
      expect(typeof CustomerAPI.SESSION).toBe('string');
    });

    it('extends core API class', () => {
      expect(new CustomerAPI(commonInit)).toBeInstanceOf(CoreAPI);
    });

    it('makes an authenticated request when a valid session token is present in the storage', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null)));

      const api = new CustomerAPI(commonInit);
      const url = api.base.toString();

      api.storage.setItem(CustomerAPI.SESSION, JSON.stringify(sampleStoredSession));
      await api.fetch(url);

      const headers = { ...commonHeaders, Authorization: `Bearer ${sampleSession.session_token}` };
      const request = new Request(url, { headers });

      expect(fetchMock).toHaveBeenCalledWith(request);
      fetchMock.mockClear();
    });

    it('automatically clears storage on request once session expires', async () => {
      const api = new CustomerAPI(commonInit);
      api.storage.setItem(CustomerAPI.SESSION, JSON.stringify(sampleStoredExpiredSession));
      await api.fetch(api.base.toString());
      expect(api.storage).toHaveLength(0);
    });

    it('makes an unauthenticated request when there is no session token', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null)));

      const api = new CustomerAPI(commonInit);
      const url = api.base.toString();

      await api.fetch(url);

      expect(fetchMock).toHaveBeenCalledWith(new Request(url, { headers: commonHeaders }));
      fetchMock.mockClear();
    });

    it('can create a session with .signIn()', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleSession))));

      const api = new CustomerAPI(commonInit);
      const url = new URL('./authenticate', api.base).toString();
      const credentials = { email: 'test@example.com', password: 'foo' };

      await api.signIn(credentials);

      expect(fetchMock).toHaveBeenCalledWith(
        new Request(url, {
          body: JSON.stringify(credentials),
          headers: commonHeaders,
          method: 'POST',
        })
      );
    });

    it('throws an error when .signIn() is called with invalid params', async () => {
      const params = ({ email: 0, passw0rd: 'foo' } as unknown) as Credentials;
      await expect(new CustomerAPI(commonInit).signIn(params)).rejects.toThrow();
    });

    it('in .signIn(), throws Core.API.AuthError with code UNAUTHORIZED on 401', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null, { status: 401 })));
      await expect(new CustomerAPI(commonInit).signIn({ email: 'foo@bar.test', password: 'foo' })).rejects.toThrow(
        new CoreAPI.AuthError({ code: 'UNAUTHORIZED' })
      );
    });

    it('in .signIn(), throws Core.API.AuthError with code UNKNOWN on statuses other than 2XX or 401', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null, { status: 500 })));
      await expect(new CustomerAPI(commonInit).signIn({ email: 'foo@bar.test', password: 'foo' })).rejects.toThrow(
        new CoreAPI.AuthError({ code: 'UNKNOWN' })
      );
    });

    it('can terminate a session with .signOut()', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleSession))));

      const api = new CustomerAPI(commonInit);
      const url = new URL('./authenticate', api.base).toString();
      await api.signOut();

      expect(api.storage).toHaveLength(0);
      expect(fetchMock).toHaveBeenCalledWith(
        new Request(url, {
          headers: commonHeaders,
          method: 'DELETE',
        })
      );
    });

    it('in .signOut(), throws Core.API.AuthError with code UNKNOWN on statuses other than 2XX', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null, { status: 500 })));
      await expect(new CustomerAPI(commonInit).signOut()).rejects.toThrow(new CoreAPI.AuthError({ code: 'UNKNOWN' }));
    });

    it('can request a password reset with .sendPasswordResetEmail()', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleSession))));

      const api = new CustomerAPI(commonInit);
      const url = new URL('./forgot_password', api.base).toString();
      const payload = { email: 'test@example.com' };

      await api.sendPasswordResetEmail(payload);

      expect(fetchMock).toHaveBeenCalledWith(
        new Request(url, {
          body: JSON.stringify(payload),
          headers: commonHeaders,
          method: 'POST',
        })
      );
    });

    it('throws an error when .sendPasswordResetEmail() is called with invalid params', async () => {
      const params = ({ email: 0 } as unknown) as { email: string };
      await expect(new CustomerAPI(commonInit).sendPasswordResetEmail(params)).rejects.toThrow();
    });

    it('in .sendPasswordResetEmail(), throws Core.API.AuthError with code UNKNOWN on statuses other than 2XX', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null, { status: 500 })));
      await expect(new CustomerAPI(commonInit).sendPasswordResetEmail({ email: 'foo@bar.test' })).rejects.toThrow(
        new CoreAPI.AuthError({ code: 'UNKNOWN' })
      );
    });
  });
});
