/** User credentials for authentication. */
export interface Credentials {
  /** Email address associated with an account. */
  email: string;
  /** Current password during regular sign-in, temporary password or a one-time code during access recovery. */
  password: string;
}

export interface Session {
  session_token: string;
  expires_in: number;
  jwt: string;
  sso?: string;
}

export interface StoredSession extends Session {
  date_created: string;
}
