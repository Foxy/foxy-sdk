import { fetch } from 'cross-fetch';
import { UniversalAPI, UniversalAPIAuthError, UniversalAPICredentials } from '../core/internal';
import { CustomerAPISession } from './types';
import { CustomerAPIGraph } from './rels';

class CustomerAPI extends UniversalAPI<CustomerAPIGraph> {
  static readonly AUTH_EXPIRES = 'fx.customer.expires';

  static readonly AUTH_HEADER = 'fx.customer';

  static readonly AUTH_TOKEN = 'fx.customer';

  static readonly AUTH_JWT = 'fx.customer.jwt';

  async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers);
    const method = init?.method?.toUpperCase() ?? 'GET';
    const token = this.storage.getItem(CustomerAPI.AUTH_TOKEN);
    const url = typeof input === 'string' ? input : input.url;

    headers.set('Content-Type', 'application/json');
    if (token !== null) headers.set(CustomerAPI.AUTH_HEADER, token);

    this.console.trace(`${method} ${url}`);
    const response = await fetch(input, { ...init, headers });
    const freshToken = response.headers.get(CustomerAPI.AUTH_HEADER);
    if (freshToken !== null) this.storage.setItem(CustomerAPI.AUTH_TOKEN, freshToken);

    return response;
  }

  async signIn(credentials: UniversalAPICredentials): Promise<void> {
    let response: Response;

    try {
      response = await fetch(new URL('authenticate', this.base).toString(), {
        headers: new Headers({ 'Content-Type': 'application/json' }),
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (err) {
      throw new UniversalAPIAuthError({
        code: UniversalAPIAuthError.UNKNOWN,
        originalError: err,
      });
    }

    if (response.ok) {
      const { jwt, cookieValue, cookieMaxAge } = (await response.json()) as CustomerAPISession;
      const expires = new Date(Date.now() + cookieMaxAge * 1000).toISOString();

      this.storage.setItem(CustomerAPI.AUTH_EXPIRES, expires);
      this.storage.setItem(CustomerAPI.AUTH_TOKEN, cookieValue);
      if (jwt) this.storage.setItem(CustomerAPI.AUTH_JWT, jwt);
    } else {
      throw new UniversalAPIAuthError({
        code: response.status.toString().startsWith('5')
          ? UniversalAPIAuthError.UNKNOWN
          : UniversalAPIAuthError.UNAUTHORIZED,
      });
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    let response: Response;

    try {
      response = await fetch(new URL('forgot_password', this.base).toString(), {
        headers: new Headers({ 'Content-Type': 'application/json' }),
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      throw new UniversalAPIAuthError({
        code: UniversalAPIAuthError.UNKNOWN,
        originalError: err,
      });
    }

    if (!response.ok) throw new UniversalAPIAuthError({ code: UniversalAPIAuthError.UNKNOWN });
  }

  async signOut(): Promise<void> {
    this.storage.clear();
  }
}

export { CustomerAPI };
export default CustomerAPI;
