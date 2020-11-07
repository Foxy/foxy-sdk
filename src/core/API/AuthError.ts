/** Constructor parameters of the  {@link UniversalAPIAuthError} class. */
type AuthErrorParams = {
  code: UniversalAPIAuthErrorCode;
  originalError?: unknown;
};

/** Union of all possible auth error codes. */
type UniversalAPIAuthErrorCode =
  | typeof AuthError['NEW_PASSWORD_REQUIRED']
  | typeof AuthError['UNAUTHORIZED']
  | typeof AuthError['UNKNOWN'];

/**
 * Base error class for all authentication-related errors in
 * the APIs that can be used both server and client-side. If you're
 * building your own API client with our SDK, you should consider using
 * this class for similar purposes.
 */
export class AuthError extends Error {
  /** Credentials are valid, but the session can be created only after changing the current password. This usually happens after a server-side password reset has been initiated for security reasons. */
  static readonly NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED';

  /** Credentials are invalid. That could mean empty or invalid email or password or otherwise incorrect auth data. */
  static readonly UNAUTHORIZED = 'UNAUTHORIZED';

  /** Any other or internal error that interrupted authentication. */
  static readonly UNKNOWN = 'UNKNOWN';

  /** Exception that triggered this error, if present. */
  readonly originalError?: unknown;

  /** Error code (see static constants on this class for possible values). */
  readonly code: UniversalAPIAuthErrorCode;

  constructor({ code, originalError }: AuthErrorParams) {
    super(`authentication failed with code ${code}`);

    this.originalError = originalError;
    this.code = code;
  }
}
