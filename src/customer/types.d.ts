export interface Session {
  /** The session lifetime as configured in Foxy (in seconds). */
  cookieMaxAge: number;
  /** Name of the auth cookie and the respective auth header. */
  cookieName: string;
  /** Value of the auth cookie and the respective auth header. */
  cookieValue: string;
  /** Optional JWT string using RS256 (public/private key) signing. */
  jwt?: string;
}

/** User credentials for authentication. */
export interface Credentials {
  /** Email address associated with an account. */
  email: string;
  /** Current password during regular sign-in, temporary password or a one-time code during access recovery. */
  password: string;
  /** New password (only needed during the access recovery or force reset). */
  newPassword?: string;
}
