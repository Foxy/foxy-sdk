import * as Core from '../core';
import Auth from '@aws-amplify/auth';
import type { Credentials } from './types';
import type { Graph } from './Graph';
import { fetch } from 'cross-fetch';

type Init = ConstructorParameters<typeof Core.API>[0] & {
  identityPoolId: string;
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
};

/**
 * Admin API provides a common interface for the `/s/admin` endpoints, whether
 * it's a default setup or a custom solution for your integration. Admin API
 * is the most feature-rich subset of Integration API available from the browser.
 */
export class API extends Core.API<Graph> {
  private readonly __auth = Auth;

  /**
   * Creates an instance of {@link AdminAPI}.
   *
   * @param init Client configuration (same as for {@link BrowserAPI}).
   */
  constructor(init: Init) {
    super(init);

    this.__auth.configure({
      identityPoolId: init.identityPoolId,
      region: init.region,
      storage: init.storage,
      userPoolId: init.userPoolId,
      userPoolWebClientId: init.userPoolWebClientId,
    });
  }

  async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const session = await this.__auth.currentSession().catch(() => null);
    const headers = new Headers(init?.headers);
    const method = init?.method?.toUpperCase() ?? 'GET';
    const url = typeof input === 'string' ? input : input.url;

    headers.set('Content-Type', 'application/json');
    if (session !== null) headers.set('Authorization', `Bearer ${session.getAccessToken().getJwtToken()}`);

    this.console.trace(`${method} ${url}`);
    return fetch(input, { ...init, headers });
  }

  async signIn(credentials: Credentials): Promise<void> {
    let user: { challengeName: string; challengeParam: Record<string, unknown> };

    try {
      user = await this.__auth.signIn(credentials.email, credentials.password);
    } catch (err) {
      throw new Core.API.AuthError({
        code: 'UNAUTHORIZED',
        originalError: err,
      });
    }

    if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
      if (credentials.newPassword) {
        try {
          await this.__auth.completeNewPassword(user, credentials.newPassword, user.challengeParam.requiredAttributes);
        } catch (err) {
          throw new Core.API.AuthError({
            code: 'UNKNOWN',
            originalError: err,
          });
        }
      } else {
        throw new Core.API.AuthError({ code: 'NEW_PASSWORD_REQUIRED' });
      }
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await this.__auth.forgotPassword(email);
    } catch (err) {
      throw new Core.API.AuthError({
        code: 'UNKNOWN',
        originalError: err,
      });
    }
  }

  async signOut(): Promise<void> {
    await this.__auth.signOut();
    this.storage.clear();
  }
}
