import { assertAuthErrorParams } from '../guards.js';
import type { AuthErrorCode } from '../guards.js';

/** Constructor parameters of the  {@link UniversalAPIAuthError} class. */
type AuthErrorParams = {
  code: AuthErrorCode;
  originalError?: unknown;
};

/**
 * Base error class for all authentication-related errors in
 * the APIs that can be used both server and client-side. If you're
 * building your own API client with our SDK, you should consider using
 * this class for similar purposes.
 */
export class AuthError extends Error {
  /** Credentials are valid, but the session can be created only after changing the current password. This usually happens after a server-side password reset has been initiated for security reasons. */
  static readonly NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED';

  /** Credentials are valid, but the new password provided in response to the `NEW_PASSWORD_REQUIRED` error doesn't meet the security requirements. */
  static readonly INVALID_NEW_PASSWORD = 'INVALID_NEW_PASSWORD';

  /** Credentials are invalid. That could mean empty or invalid email or password or otherwise incorrect auth data. */
  static readonly UNAUTHORIZED = 'UNAUTHORIZED';

  /** Provided form data is invalid, e.g. email is too long or captcha is expired. */
  static readonly INVALID_FORM = 'INVALID_FORM';

  /** Provided email is already taken. Applies to customer registration only. */
  static readonly UNAVAILABLE = 'UNAVAILABLE';

  /** Any other or internal error that interrupted authentication. */
  static readonly UNKNOWN = 'UNKNOWN';

  /** OAuth token refresh failed — the refresh token, client ID, or client secret may be invalid, or the token endpoint is unreachable. */
  static readonly TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED';

  /** Exception that triggered this error, if present. */
  readonly originalError?: unknown;

  /** Error code (see static constants on this class for possible values). */
  readonly code: AuthErrorCode;

  constructor(params: AuthErrorParams) {
    assertAuthErrorParams(params);
    super(`authentication failed with code ${params.code}`);

    this.originalError = params.originalError;
    this.code = params.code;
  }
}
