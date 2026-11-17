jest.mock('cross-fetch', () => ({
  Headers: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Headers,
  Request: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Request,
  Response: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Response,
  default: jest.fn(),
  fetch: jest.fn(),
}));

import { Request, Response, fetch } from 'cross-fetch';
import { VisibleStorage, safeStringify } from '../utils';

import { ArgumentError } from '../../src/core/v8n';
import { API as CoreAPI } from '../../src/core/API';
import { Credentials, SignUpParams } from '../../src/customer/types';
import { API as CustomerAPI } from '../../src/customer/API';
import { exec } from 'child_process';
import { inspect } from 'util';

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
  force_password_reset: false,
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

    it('keeps the stored session out of inspect, JSON and Object.keys output', () => {
      const storage = new VisibleStorage();
      const api = new CustomerAPI({ ...commonInit, storage });
      api.storage.setItem(CustomerAPI.SESSION, JSON.stringify(sampleStoredSession));

      expect(inspect(api, { depth: null, showHidden: false })).not.toContain(sampleSession.session_token);
      expect(safeStringify(api)).not.toContain(sampleSession.session_token);
      expect(Object.keys(api)).not.toContain('storage');
      expect(api.storage).toBe(storage);
      expect(api.storage.getItem(CustomerAPI.SESSION)).toContain(sampleSession.session_token);
    });

    it('keeps the stored session out of the error when constructor params are invalid', () => {
      const storage = new VisibleStorage();
      storage.setItem(CustomerAPI.SESSION, JSON.stringify(sampleStoredSession));
      const init = ({ ...commonInit, level: 'error', storage } as unknown) as ConstructorParameters<
        typeof CustomerAPI
      >[0];

      let error: unknown;

      try {
        new CustomerAPI(init);
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(ArgumentError);
      expect((error as Error).message).toContain('init.level');
      expect(inspect(error, { depth: null })).not.toContain(sampleSession.session_token);
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

    it('supports Request instances in .fetch()', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(null)));

      const api = new CustomerAPI(commonInit);
      const url = api.base.toString();

      await api.fetch(new Request(url));

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

    it('keeps the password out of the error when .signIn() params are invalid', async () => {
      const params = ({ email: 0, password: 'customer-password-value' } as unknown) as Credentials;
      const error = await new CustomerAPI(commonInit).signIn(params).catch(err => err);

      expect(error).toBeInstanceOf(ArgumentError);
      expect((error as Error).message).toContain('credentials.email');
      expect(inspect(error, { depth: null })).not.toContain('customer-password-value');
    });

    it('keeps the password out of the error when .signUp() params are invalid', async () => {
      const params = ({
        email: 0,
        password: 'customer-password-value',
        verification: { token: 'abc', type: 'hcaptcha' },
      } as unknown) as SignUpParams;

      const error = await new CustomerAPI(commonInit).signUp(params).catch(err => err);

      expect(error).toBeInstanceOf(ArgumentError);
      expect((error as Error).message).toContain('params.email');
      expect(inspect(error, { depth: null })).not.toContain('customer-password-value');
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

    it('can register a customer with valid parameters', async () => {
      const params: SignUpParams = {
        verification: { type: 'hcaptcha', token: 'abc123' },
        password: 'password123',
        email: 'test@example.com',
      };

      const expectedUrl = new URL('./sign_up', commonInit.base).toString();
      const expectedBody = JSON.stringify(params);

      fetchMock.mockImplementationOnce(async (url, options) => {
        const request = new Request(url as RequestInfo, options as RequestInit);
        expect(request.url).toBe(expectedUrl);
        expect(request.method).toBe('POST');
        expect(await request.text()).toBe(expectedBody);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      });

      await new CustomerAPI(commonInit).signUp(params);

      expect(fetchMock).toHaveBeenCalledWith(
        new Request(expectedUrl, {
          headers: commonHeaders,
          method: 'POST',
          body: expectedBody,
        })
      );

      fetchMock.mockClear();
    });

    it('throws an error with code UNAVAILABLE if the email is already taken', async () => {
      const params: SignUpParams = {
        verification: { type: 'hcaptcha', token: 'abc123' },
        password: 'password123',
        email: 'test@example.com',
      };

      fetchMock.mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 403 })));

      const api = new CustomerAPI(commonInit);
      await expect(api.signUp(params)).rejects.toThrow(new CoreAPI.AuthError({ code: 'UNAVAILABLE' }));

      fetchMock.mockClear();
    });

    it('throws an error with code UNAUTHORIZED if customer registration is disabled', async () => {
      const params: SignUpParams = {
        verification: { type: 'hcaptcha', token: 'abc123' },
        password: 'password123',
        email: 'test@example.com',
      };

      fetchMock.mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 401 })));

      const api = new CustomerAPI(commonInit);
      await expect(api.signUp(params)).rejects.toThrow(new CoreAPI.AuthError({ code: 'UNAUTHORIZED' }));

      fetchMock.mockClear();
    });

    it('throws an error with code INVALID_FORM if captcha is expired', async () => {
      const params: SignUpParams = {
        verification: { type: 'hcaptcha', token: 'abc123' },
        password: 'password123',
        email: 'test@example.com',
      };

      fetchMock.mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 400 })));

      const api = new CustomerAPI(commonInit);
      await expect(api.signUp(params)).rejects.toThrow(new CoreAPI.AuthError({ code: 'INVALID_FORM' }));

      fetchMock.mockClear();
    });

    it('throws an error with code UNKNOWN when sign up request fails with an unknown error', async () => {
      const params: SignUpParams = {
        verification: { type: 'hcaptcha', token: 'abc123' },
        password: 'password123',
        email: 'test@example.com',
      };

      fetchMock.mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 500 })));

      const api = new CustomerAPI(commonInit);
      await expect(api.signUp(params)).rejects.toThrow(new CoreAPI.AuthError({ code: 'UNKNOWN' }));

      fetchMock.mockClear();
    });

    it('returns force_password_reset value in usesTemporaryPassword (false)', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(sampleSession))));

      const api = new CustomerAPI(commonInit);
      const credentials = { email: 'test@example.com', password: 'foo' };

      expect(api.usesTemporaryPassword).toBe(false);
      await api.signIn(credentials);
      expect(api.usesTemporaryPassword).toBe(false);
    });

    it('returns force_password_reset value in usesTemporaryPassword (true)', async () => {
      fetchMock.mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify({ ...sampleSession, force_password_reset: true })))
      );

      const api = new CustomerAPI(commonInit);
      const credentials = { email: 'test@example.com', password: 'foo' };

      expect(api.usesTemporaryPassword).toBe(false);
      await api.signIn(credentials);
      expect(api.usesTemporaryPassword).toBe(true);
    });

    it('throws an error when usesTemporaryPassword setter is called with invalid value', async () => {
      // @ts-expect-error testing invalid input
      expect(() => (new CustomerAPI(commonInit).usesTemporaryPassword = 'foo')).toThrow();
    });

    it('sets force_password_reset value in usesTemporaryPassword', async () => {
      fetchMock.mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify({ ...sampleSession, force_password_reset: true })))
      );

      const api = new CustomerAPI(commonInit);
      const credentials = { email: 'test@example.com', password: 'foo' };

      expect(api.usesTemporaryPassword).toBe(false);
      await api.signIn(credentials);
      expect(api.usesTemporaryPassword).toBe(true);

      api.usesTemporaryPassword = false;
      expect(api.usesTemporaryPassword).toBe(false);
      expect(JSON.parse(api.storage.getItem(CustomerAPI.SESSION) as string)).toHaveProperty(
        'force_password_reset',
        false
      );
    });

    it('errors when constructed with a fetch that is not a function', () => {
      const init = ({ ...commonInit, fetch: 1 } as unknown) as ConstructorParameters<typeof CustomerAPI>[0];
      expect(() => new CustomerAPI(init)).toThrow();
    });

    it('sends requests with session headers through a custom fetch', async () => {
      fetchMock.mockClear();
      const customFetch = jest.fn(() => Promise.resolve(new Response('{}')));
      const api = new CustomerAPI({ ...commonInit, fetch: customFetch });
      const url = new URL('./customer_portal_settings', api.base).toString();

      api.storage.setItem(CustomerAPI.SESSION, JSON.stringify(sampleStoredSession));
      await api.fetch(url);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(customFetch).toHaveBeenCalledTimes(1);

      const [calledURL, init] = (customFetch.mock.calls[0] as unknown) as [string, RequestInit];
      expect(calledURL).toBe(url);
      expect(init.method).toBe('GET');
      expect(init.headers).toEqual({
        'authorization': `Bearer ${sampleSession.session_token}`,
        'content-type': 'application/json',
        'foxy-api-version': '1',
      });
    });

    it('signs in through a custom fetch', async () => {
      fetchMock.mockClear();
      const customFetch = jest.fn(() => Promise.resolve(new Response(JSON.stringify(sampleSession))));
      const api = new CustomerAPI({ ...commonInit, fetch: customFetch });
      const credentials = { email: 'foo@example.com', password: 'bar' };

      await api.signIn(credentials);

      expect(fetchMock).not.toHaveBeenCalled();
      const [calledURL, init] = (customFetch.mock.calls[0] as unknown) as [string, RequestInit];
      expect(calledURL).toBe(new URL('./authenticate', commonInit.base).toString());
      expect(init.method).toBe('POST');
      expect(JSON.parse(Buffer.from(init.body as ArrayBuffer).toString())).toEqual(credentials);
      expect(JSON.parse(api.storage.getItem(CustomerAPI.SESSION) as string)).toMatchObject(sampleSession);
    });
  });
});
