export interface CustomerAPISession {
  /** The session lifetime as configured in Foxy (in seconds). */
  cookieMaxAge: number;
  /** Name of the auth cookie and the respective auth header. */
  cookieName: string;
  /** Value of the auth cookie and the respective auth header. */
  cookieValue: string;
  /** Optional JWT string using RS256 (public/private key) signing. */
  jwt?: string;
}
