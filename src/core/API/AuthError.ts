import v8n from 'v8n';

/** Constructor parameters of the  {@link UniversalAPIAuthError} class. */
type AuthErrorParams = {
  code: UniversalAPIAuthErrorCode;
  originalError?: unknown;
};

/** Union of all possible auth error codes. */
type UniversalAPIAuthErrorCode =
  | typeof AuthError['NEW_PASSWORD_REQUIRED']
  | typeof AuthError['INVALID_NEW_PASSWORD']
  | typeof AuthError['UNAUTHORIZED']
  | typeof AuthError['INVALID_FORM']
  | typeof AuthError['UNAVAILABLE']
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

  /** Available class member validators. */
  static readonly v8n = {
    constructor: v8n().schema({
      code: v8n().passesAnyOf(
        v8n().exact(AuthError.NEW_PASSWORD_REQUIRED),
        v8n().exact(AuthError.INVALID_NEW_PASSWORD),
        v8n().exact(AuthError.UNAUTHORIZED),
        v8n().exact(AuthError.INVALID_FORM),
        v8n().exact(AuthError.UNAVAILABLE),
        v8n().exact(AuthError.UNKNOWN)
      ),
    }),
  };

  /** Exception that triggered this error, if present. */
  readonly originalError?: unknown;

  /** Error code (see static constants on this class for possible values). */
  readonly code: UniversalAPIAuthErrorCode;

  constructor(params: AuthErrorParams) {
    AuthError.v8n.constructor.check(params);
    super(`authentication failed with code ${params.code}`);

    this.originalError = params.originalError;
    this.code = params.code;
  }
}
