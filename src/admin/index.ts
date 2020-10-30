import { APIInit, UniversalAPI, UniversalAPIAuthError, UniversalAPICredentials } from '../core/internal';
import { AuthClass } from '@aws-amplify/auth/lib/Auth';
import { IntegrationAPIGraph } from '../integration/rels';
import { fetch } from 'cross-fetch';

/**
 * Admin API provides a common interface for the `/s/admin` endpoints, whether
 * it's a default setup or a custom solution for your integration. Admin API
 * is the most feature-rich subset of Integration API available from the browser.
 */
class AdminAPI extends UniversalAPI<IntegrationAPIGraph> {
  private readonly __auth: AuthClass;

  /**
   * Creates an instance of {@link AdminAPI}.
   *
   * @param params Client configuration (same as for {@link BrowserAPI}).
   */
  constructor(params: APIInit) {
    super(params);

    // TODO: change to production value
    this.__auth = new AuthClass({
      identityPoolId: 'us-east-2:6e3cb428-0e77-495e-9960-f4ab46d4dca1',
      region: 'us-east-2',
      storage: params.storage,
      userPoolId: 'us-east-2_2Vw7tMmLQ',
      userPoolWebClientId: '2i58qs1u38kv605rm3v5t4dake',
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

  async signIn(credentials: UniversalAPICredentials): Promise<void> {
    let user: { challengeName: string; challengeParam: Record<string, unknown> };

    try {
      user = await this.__auth.signIn(credentials.email, credentials.password);
    } catch (err) {
      throw new UniversalAPIAuthError({
        code: UniversalAPIAuthError.UNAUTHORIZED,
        originalError: err,
      });
    }

    if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
      if (credentials.newPassword) {
        try {
          await this.__auth.completeNewPassword(user, credentials.newPassword, user.challengeParam.requiredAttributes);
        } catch (err) {
          throw new UniversalAPIAuthError({
            code: UniversalAPIAuthError.UNKNOWN,
            originalError: err,
          });
        }
      } else {
        throw new UniversalAPIAuthError({ code: UniversalAPIAuthError.NEW_PASSWORD_REQUIRED });
      }
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await this.__auth.forgotPassword(email);
    } catch (err) {
      throw new UniversalAPIAuthError({
        code: UniversalAPIAuthError.UNKNOWN,
        originalError: err,
      });
    }
  }

  async signOut(): Promise<void> {
    await this.__auth.signOut();
    this.storage.clear();
  }
}

export { AdminAPI };
export default AdminAPI;
