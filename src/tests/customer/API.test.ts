import type { Credentials, SignUpParams, StoredSession } from '../../customer/types';
import type { Mock } from 'vitest';

import { API as CoreAPI } from '../../core/index.js';
import { API as CustomerAPI } from '../../customer/API.js';

let fetchMock: Mock<typeof globalThis.fetch>;

beforeEach(() => {
  fetchMock = vi.spyOn(globalThis, 'fetch');
});

afterEach(() => {
  vi.restoreAllMocks();
});

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

const sampleStoredRecentSession = Object.assign({}, sampleSession, {
  date_created: new Date(Date.now() - 5 * 60_000).toISOString(),
});

function collectSessions(api: CustomerAPI) {
  const details: (StoredSession | null)[] = [];
  api.addEventListener('session', evt => details.push(evt.detail));
  return details;
}

describe('Customer', () => {
  describe('API', () => {
    it('has no credentials storage', () => {
      expect(CustomerAPI).not.toHaveProperty('SESSION');
      expect(new CustomerAPI(commonInit)).not.toHaveProperty('storage');
    });

    it('extends core API class', () => {
      expect(new CustomerAPI(commonInit)).toBeInstanceOf(CoreAPI);
    });

    it('makes an authenticated request when a valid session token is present in the storage', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new CustomerAPI(commonInit);
      const url = api.base.toString();

      api.setSession(sampleStoredSession);
      await api.fetch(url);

      const request = fetchMock.mock.calls[0][0] as Request;

      expect(request.url).toBe(url);
      expect(request.headers.get('Authorization')).toBe(`Bearer ${sampleSession.session_token}`);
      expect(request.headers.get('Content-Type')).toBe('application/json');
      expect(request.headers.get('FOXY-API-VERSION')).toBe('1');
    });

    it('automatically drops the session on request once it expires', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new CustomerAPI(commonInit);
      const sessions = collectSessions(api);

      api.setSession(sampleStoredExpiredSession);
      await api.fetch(api.base.toString());

      expect(sessions).toEqual([null]);

      const request = fetchMock.mock.calls[0][0] as Request;
      expect(request.headers.get('Authorization')).toBeNull();
    });

    it('treats a session older than its expires_in window as expired', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const session = { ...sampleStoredRecentSession, expires_in: 60 };
      const api = new CustomerAPI(commonInit);
      const sessions = collectSessions(api);

      api.setSession(session);
      await api.fetch(api.base.toString());

      expect(sessions).toEqual([null]);

      const request = fetchMock.mock.calls[0][0] as Request;
      expect(request.headers.get('Authorization')).toBeNull();
    });

    it('treats a session still inside its expires_in window as live', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new CustomerAPI(commonInit);
      const sessions = collectSessions(api);

      api.setSession(sampleStoredRecentSession);
      await api.fetch(api.base.toString());

      expect(sessions).toHaveLength(1);
      expect(sessions[0]).not.toBeNull();

      const request = fetchMock.mock.calls[0][0] as Request;
      expect(request.headers.get('Authorization')).toBe(`Bearer ${sampleSession.session_token}`);
    });

    it('re-stamps date_created on a successful authenticated request', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new CustomerAPI(commonInit);
      const before = Date.now();

      const sessions = collectSessions(api);

      api.setSession(sampleStoredRecentSession);
      await api.fetch(api.base.toString());

      expect(sessions).toHaveLength(1);
      expect(new Date(sessions[0]!.date_created).getTime()).toBeGreaterThanOrEqual(before);
      expect(sessions[0]!.session_token).toBe(sampleSession.session_token);
    });

    it('keeps date_created as-is when an authenticated request fails', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

      const api = new CustomerAPI(commonInit);

      const sessions = collectSessions(api);

      api.setSession(sampleStoredRecentSession);
      await api.fetch(api.base.toString());

      expect(sessions).toEqual([]);
    });

    it('makes an unauthenticated request when there is no session token', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new CustomerAPI(commonInit);
      const url = api.base.toString();

      await api.fetch(url);

      const request = fetchMock.mock.calls[0][0] as Request;

      expect(request.url).toBe(url);
      expect(request.headers.get('Authorization')).toBeNull();
      expect(request.headers.get('Content-Type')).toBe('application/json');
      expect(request.headers.get('FOXY-API-VERSION')).toBe('1');
    });

    it('supports Request instances in .fetch()', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new CustomerAPI(commonInit);
      const url = api.base.toString();

      await api.fetch(new Request(url));

      const request = fetchMock.mock.calls[0][0] as Request;

      expect(request.url).toBe(url);
      expect(request.headers.get('Authorization')).toBeNull();
      expect(request.headers.get('Content-Type')).toBe('application/json');
      expect(request.headers.get('FOXY-API-VERSION')).toBe('1');
    });

    it('can create a session with .signIn()', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify(sampleSession)));

      const api = new CustomerAPI(commonInit);
      const url = new URL('./authenticate', api.base).toString();
      const credentials = { email: 'test@example.com', password: 'foo' };

      await api.signIn(credentials);

      const request = fetchMock.mock.calls[0][0] as Request;

      expect(request.url).toBe(url);
      expect(request.method).toBe('POST');
      expect(request.headers.get('Content-Type')).toBe('application/json');
      expect(request.headers.get('FOXY-API-VERSION')).toBe('1');
      expect(await request.text()).toBe(JSON.stringify(credentials));
    });

    it('throws an error when .signIn() is called with invalid params', async () => {
      const params = ({ email: 0, passw0rd: 'foo' } as unknown) as Credentials;
      await expect(new CustomerAPI(commonInit).signIn(params)).rejects.toThrow(TypeError);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('in .signIn(), throws Core.API.AuthError with code UNAUTHORIZED on 401', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
      await expect(new CustomerAPI(commonInit).signIn({ email: 'foo@bar.test', password: 'foo' })).rejects.toThrow(
        new CoreAPI.AuthError({ code: 'UNAUTHORIZED' })
      );
    });

    it('in .signIn(), throws Core.API.AuthError with code UNKNOWN on statuses other than 2XX or 401', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
      await expect(new CustomerAPI(commonInit).signIn({ email: 'foo@bar.test', password: 'foo' })).rejects.toThrow(
        new CoreAPI.AuthError({ code: 'UNKNOWN' })
      );
    });

    it('can terminate a session with .signOut()', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify(sampleSession)));

      const api = new CustomerAPI(commonInit);
      const url = new URL('./authenticate', api.base).toString();

      const sessions = collectSessions(api);

      api.setSession(sampleStoredSession);
      await api.signOut();

      // The DELETE request itself refreshes the session before sign-out clears it.
      expect(sessions.at(-1)).toBeNull();
      expect(api.session).toBeNull();

      const request = fetchMock.mock.calls[0][0] as Request;

      expect(request.url).toBe(url);
      expect(request.method).toBe('DELETE');
      expect(request.headers.get('Authorization')).toBe(`Bearer ${sampleSession.session_token}`);
      expect(request.headers.get('Content-Type')).toBe('application/json');
      expect(request.headers.get('FOXY-API-VERSION')).toBe('1');
    });

    it('in .signOut(), throws Core.API.AuthError with code UNKNOWN on statuses other than 2XX', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
      await expect(new CustomerAPI(commonInit).signOut()).rejects.toThrow(new CoreAPI.AuthError({ code: 'UNKNOWN' }));
    });

    it('can request a password reset with .sendPasswordResetEmail()', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify(sampleSession)));

      const api = new CustomerAPI(commonInit);
      const url = new URL('./forgot_password', api.base).toString();
      const payload = { email: 'test@example.com' };

      await api.sendPasswordResetEmail(payload);

      const request = fetchMock.mock.calls[0][0] as Request;

      expect(request.url).toBe(url);
      expect(request.method).toBe('POST');
      expect(request.headers.get('Content-Type')).toBe('application/json');
      expect(request.headers.get('FOXY-API-VERSION')).toBe('1');
      expect(await request.text()).toBe(JSON.stringify(payload));
    });

    it('throws an error when .sendPasswordResetEmail() is called with invalid params', async () => {
      const params = ({ email: 0 } as unknown) as { email: string };
      await expect(new CustomerAPI(commonInit).sendPasswordResetEmail(params)).rejects.toThrow(TypeError);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('in .sendPasswordResetEmail(), throws Core.API.AuthError with code UNKNOWN on statuses other than 2XX', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
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

      fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: true })));

      await new CustomerAPI(commonInit).signUp(params);

      const request = fetchMock.mock.calls[0][0] as Request;

      expect(request.url).toBe(expectedUrl);
      expect(request.method).toBe('POST');
      expect(request.headers.get('Content-Type')).toBe('application/json');
      expect(request.headers.get('FOXY-API-VERSION')).toBe('1');
      expect(await request.text()).toBe(expectedBody);
    });

    it('can register a customer without a password', async () => {
      const params: SignUpParams = {
        verification: { type: 'hcaptcha', token: 'abc123' },
        email: 'test@example.com',
      };

      const expectedUrl = new URL('./sign_up', commonInit.base).toString();

      fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: true })));

      await new CustomerAPI(commonInit).signUp(params);

      const request = fetchMock.mock.calls[0][0] as Request;
      const body = JSON.parse(await request.text());

      expect(request.url).toBe(expectedUrl);
      expect(request.method).toBe('POST');
      expect(body).not.toHaveProperty('password');
    });

    it('throws an error with code UNAVAILABLE if the email is already taken', async () => {
      const params: SignUpParams = {
        verification: { type: 'hcaptcha', token: 'abc123' },
        password: 'password123',
        email: 'test@example.com',
      };

      fetchMock.mockResolvedValue(new Response(null, { status: 403 }));

      const api = new CustomerAPI(commonInit);
      await expect(api.signUp(params)).rejects.toThrow(new CoreAPI.AuthError({ code: 'UNAVAILABLE' }));
    });

    it('throws an error with code UNAUTHORIZED if customer registration is disabled', async () => {
      const params: SignUpParams = {
        verification: { type: 'hcaptcha', token: 'abc123' },
        password: 'password123',
        email: 'test@example.com',
      };

      fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

      const api = new CustomerAPI(commonInit);
      await expect(api.signUp(params)).rejects.toThrow(new CoreAPI.AuthError({ code: 'UNAUTHORIZED' }));
    });

    it('throws an error with code INVALID_FORM if captcha is expired', async () => {
      const params: SignUpParams = {
        verification: { type: 'hcaptcha', token: 'abc123' },
        password: 'password123',
        email: 'test@example.com',
      };

      fetchMock.mockResolvedValue(new Response(null, { status: 400 }));

      const api = new CustomerAPI(commonInit);
      await expect(api.signUp(params)).rejects.toThrow(new CoreAPI.AuthError({ code: 'INVALID_FORM' }));
    });

    it('throws an error with code UNKNOWN when sign up request fails with an unknown error', async () => {
      const params: SignUpParams = {
        verification: { type: 'hcaptcha', token: 'abc123' },
        password: 'password123',
        email: 'test@example.com',
      };

      fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

      const api = new CustomerAPI(commonInit);
      await expect(api.signUp(params)).rejects.toThrow(new CoreAPI.AuthError({ code: 'UNKNOWN' }));
    });

    it('returns force_password_reset value in usesTemporaryPassword (false)', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify(sampleSession)));

      const api = new CustomerAPI(commonInit);
      const credentials = { email: 'test@example.com', password: 'foo' };

      expect(api.usesTemporaryPassword).toBe(false);
      await api.signIn(credentials);
      expect(api.usesTemporaryPassword).toBe(false);
    });

    it('returns force_password_reset value in usesTemporaryPassword (true)', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify({ ...sampleSession, force_password_reset: true })));

      const api = new CustomerAPI(commonInit);
      const credentials = { email: 'test@example.com', password: 'foo' };

      expect(api.usesTemporaryPassword).toBe(false);
      await api.signIn(credentials);
      expect(api.usesTemporaryPassword).toBe(true);
    });

    it('throws an error when usesTemporaryPassword setter is called with invalid value', async () => {
      // @ts-expect-error testing invalid input
      expect(() => (new CustomerAPI(commonInit).usesTemporaryPassword = 'foo')).toThrow(TypeError);
    });

    it('sets force_password_reset value in usesTemporaryPassword', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify({ ...sampleSession, force_password_reset: true })));

      const api = new CustomerAPI(commonInit);
      const credentials = { email: 'test@example.com', password: 'foo' };

      const sessions = collectSessions(api);

      expect(api.usesTemporaryPassword).toBe(false);
      await api.signIn(credentials);
      expect(api.usesTemporaryPassword).toBe(true);

      api.usesTemporaryPassword = false;
      expect(api.usesTemporaryPassword).toBe(false);
      expect(sessions.at(-1)).toHaveProperty('force_password_reset', false);
    });

    it('validates the session in .setSession(), accepts null, and does not dispatch session', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new CustomerAPI(commonInit);
      const sessions = collectSessions(api);

      // @ts-expect-error testing invalid input
      expect(() => api.setSession({ session_token: 1 })).toThrow(TypeError);
      expect(() => api.setSession(null)).not.toThrow();

      api.setSession(sampleStoredSession);
      expect(sessions).toEqual([]);

      await api.fetch(api.base.toString());
      const request = fetchMock.mock.calls[0][0] as Request;
      expect(request.headers.get('Authorization')).toBe(`Bearer ${sampleSession.session_token}`);
    });

    it('returns a copy of the current session from the session getter', () => {
      const api = new CustomerAPI(commonInit);
      expect(api.session).toBeNull();

      api.setSession(sampleStoredSession);
      expect(api.session).toEqual(sampleStoredSession);

      api.session!.session_token = 'changed';
      expect(api.session).toEqual(sampleStoredSession);
    });

    it('copies the session passed to .setSession()', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new CustomerAPI(commonInit);
      const session = { ...sampleStoredSession };

      api.setSession(session);
      session.session_token = 'changed';
      await api.fetch(api.base.toString());

      const request = fetchMock.mock.calls[0][0] as Request;
      expect(request.headers.get('Authorization')).toBe(`Bearer ${sampleSession.session_token}`);
    });

    it('dispatches session with a fresh date_created on .signIn()', async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify(sampleSession)));

      const api = new CustomerAPI(commonInit);
      const sessions = collectSessions(api);
      const before = Date.now();

      await api.signIn({ email: 'test@example.com', password: 'foo' });

      expect(sessions).toHaveLength(1);
      expect(sessions[0]).toMatchObject(sampleSession);
      expect(new Date(sessions[0]!.date_created).getTime()).toBeGreaterThanOrEqual(before);
    });

    it('dispatches session with a newer date_created after a successful authenticated request', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new CustomerAPI(commonInit);
      const sessions = collectSessions(api);

      api.setSession(sampleStoredRecentSession);
      await api.fetch(api.base.toString());

      expect(sessions).toHaveLength(1);
      expect(new Date(sessions[0]!.date_created).getTime()).toBeGreaterThan(
        new Date(sampleStoredRecentSession.date_created).getTime()
      );
    });

    it('does not dispatch session after a failed authenticated request', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

      const api = new CustomerAPI(commonInit);
      const sessions = collectSessions(api);

      api.setSession(sampleStoredRecentSession);
      await api.fetch(api.base.toString());

      expect(sessions).toEqual([]);
    });

    it('dispatches session when usesTemporaryPassword is set with a session', () => {
      const api = new CustomerAPI(commonInit);
      const sessions = collectSessions(api);

      api.setSession(sampleStoredSession);
      api.usesTemporaryPassword = true;

      expect(sessions).toHaveLength(1);
      expect(sessions[0]).toHaveProperty('force_password_reset', true);
      expect(api.usesTemporaryPassword).toBe(true);
    });

    it('does nothing when usesTemporaryPassword is set without a session', () => {
      const api = new CustomerAPI(commonInit);
      const sessions = collectSessions(api);

      api.usesTemporaryPassword = true;

      expect(sessions).toEqual([]);
      expect(api.usesTemporaryPassword).toBe(false);
    });

    it('sends no Authorization header after .signOut()', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new CustomerAPI(commonInit);

      api.setSession(sampleStoredSession);
      await api.signOut();
      await api.fetch(api.base.toString());

      const request = fetchMock.mock.calls[1][0] as Request;
      expect(request.headers.get('Authorization')).toBeNull();
    });

    it('does not refresh the session when it was replaced during the request', async () => {
      let resolve!: (response: Response) => void;
      fetchMock.mockReturnValueOnce(new Promise<Response>(r => (resolve = r)));
      fetchMock.mockResolvedValue(new Response(null));

      const api = new CustomerAPI(commonInit);
      const sessions = collectSessions(api);

      api.setSession(sampleStoredRecentSession);
      const pending = api.fetch(api.base.toString());

      api.setSession(null);
      resolve(new Response(null));
      await pending;

      expect(sessions).toEqual([]);

      await api.fetch(api.base.toString());
      const request = fetchMock.mock.calls[1][0] as Request;
      expect(request.headers.get('Authorization')).toBeNull();
    });

    it('does not let changes to event.detail affect the session', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new CustomerAPI(commonInit);
      api.addEventListener('session', evt => {
        if (evt.detail) evt.detail.session_token = 'changed';
      });

      api.setSession(sampleStoredRecentSession);
      await api.fetch(api.base.toString());
      await api.fetch(api.base.toString());

      const request = fetchMock.mock.calls[1][0] as Request;
      expect(request.headers.get('Authorization')).toBe(`Bearer ${sampleSession.session_token}`);
    });

    it('stops delivering session events after .removeEventListener()', async () => {
      fetchMock.mockResolvedValue(new Response(null));

      const api = new CustomerAPI(commonInit);
      const listener = vi.fn();

      api.addEventListener('session', listener);
      api.removeEventListener('session', listener);
      api.setSession(sampleStoredRecentSession);
      await api.fetch(api.base.toString());

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
