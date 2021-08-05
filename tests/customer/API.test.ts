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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Expect {
      toBeWithinOneMinuteOf(date: Date): void;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toBeWithinOneMinuteOf(date: Date): void;
    }
  }
}

expect.extend({
  toBeWithinOneMinuteOf(got, expected) {
    const difference = Math.abs(expected.getTime() - got.getTime());
    const message = () => `${got} should be within a minute of ${expected}.`;
    const pass = difference < 60000;

    return { message, pass };
  },
});

const fetchMock = (fetch as unknown) as jest.MockInstance<unknown, unknown[]>;

const commonHeaders = {
  'Content-Type': 'application/json',
  'FOXY-API-VERSION': '1',
};

const commonInit = {
  base: new URL('https://demo.foxycart.test/s/customer/'),
  level: -1,
};

const session = {
  expires_in: 86400,
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.NQemf8P8qIf_5lPQNqstWDGnAAfhjO1rGzHNqE8Fwuw',
  session_token: '20crb85zhy2y3hgrhyjthr96c43fgh43fda84klgh34q1fjmna90iubl',
  sso: 'https://example.com/sso?token=123',
};

describe('Customer', () => {
  describe('API', () => {
    it('exposes storage key for customer session token as static property', () => {
      expect(CustomerAPI).toHaveProperty('SESSION_TOKEN');
      expect(typeof CustomerAPI.SESSION_TOKEN).toBe('string');
    });

    it('exposes storage key for max session lifetime value as static property', () => {
      expect(CustomerAPI).toHaveProperty('EXPIRY');
      expect(typeof CustomerAPI.EXPIRY).toBe('string');
    });

    it('exposes storage key for JWT representing authenticated customer as static property', () => {
      expect(CustomerAPI).toHaveProperty('JWT');
      expect(typeof CustomerAPI.JWT).toBe('string');
    });

    it('exposes storage key for SSO URL as static property', () => {
      expect(CustomerAPI).toHaveProperty('SSO');
      expect(typeof CustomerAPI.SSO).toBe('string');
    });

    it('extends core API class', () => {
      expect(new CustomerAPI(commonInit)).toBeInstanceOf(CoreAPI);
    });

    it('makes an authenticated request when a valid session token is present in the storage', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null)));

      const api = new CustomerAPI(commonInit);
      const url = api.base.toString();

      api.storage.setItem(CustomerAPI.SESSION_TOKEN, session.session_token);
      await api.fetch(url);

      const headers = { ...commonHeaders, Authorization: `Bearer ${session.session_token}` };
      const request = new Request(url, { headers });

      expect(fetchMock).toHaveBeenCalledWith(request);
      fetchMock.mockClear();
    });

    it('updates expiry date for storage items on each request', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null)));

      const expiryAsString = String(session.expires_in);
      const api = new CustomerAPI(commonInit);
      const url = api.base.toString();

      api.storage.setItem(CustomerAPI.SESSION_TOKEN, session.session_token);
      api.storage.setItem(CustomerAPI.EXPIRY, expiryAsString);
      api.storage.setItem(CustomerAPI.JWT, session.jwt);
      api.storage.setItem(CustomerAPI.SSO, session.sso);

      const setItemSpy = jest.spyOn(api.storage, 'setItem');
      const setItemOptionsSchema = expect.objectContaining({
        expires: expect.toBeWithinOneMinuteOf(new Date(Date.now() + session.expires_in)),
      });

      await api.fetch(url);

      expect(setItemSpy).toHaveBeenCalledWith(CustomerAPI.SESSION_TOKEN, session.session_token, setItemOptionsSchema);
      expect(setItemSpy).toHaveBeenCalledWith(CustomerAPI.EXPIRY, expiryAsString, setItemOptionsSchema);
      expect(setItemSpy).toHaveBeenCalledWith(CustomerAPI.JWT, session.jwt, setItemOptionsSchema);
      expect(setItemSpy).toHaveBeenCalledWith(CustomerAPI.SSO, session.sso, setItemOptionsSchema);

      setItemSpy.mockRestore();
      setItemSpy.mockReset();
      fetchMock.mockClear();
    });

    it('makes an unauthenticated request when there is no session token', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null)));

      const api = new CustomerAPI(commonInit);
      const url = api.base.toString();

      await api.fetch(url);

      expect(fetchMock).toHaveBeenCalledWith(new Request(url, { headers: commonHeaders }));
      fetchMock.mockClear();
    });

    it('supports Request instances in .fetch()', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null)));

      const api = new CustomerAPI(commonInit);
      const url = api.base.toString();

      await api.fetch(new Request(url));

      expect(fetchMock).toHaveBeenCalledWith(new Request(url, { headers: commonHeaders }));
      fetchMock.mockClear();
    });

    it('can create a session with .signIn()', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(session))));

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

      expect(api.storage.getItem(CustomerAPI.SESSION_TOKEN)).toEqual(session.session_token);
      expect(api.storage.getItem(CustomerAPI.EXPIRY)).toEqual(String(session.expires_in));
      expect(api.storage.getItem(CustomerAPI.JWT)).toEqual(session.jwt);
      expect(api.storage.getItem(CustomerAPI.SSO)).toEqual(session.sso);
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
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(session))));

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
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(session))));

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
