/** User credentials for authentication. */
export interface Credentials {
  /** Email address associated with an account. */
  email: string;
  /** Current password during regular sign-in, temporary password or a one-time code during access recovery. */
  password: string;
}

/** Account creation parameters. */
export interface SignUpParams {
  /** Signup verification (currently only hCaptcha is supported). */
  verification: {
    /** Verification type. Currently only hCaptcha is supported. */
    type: 'hcaptcha';
    /** hCaptcha verification token. */
    token: string;
  };
  /** Customer's first name, optional, up to 50 characters. */
  first_name?: string;
  /** Customer's last name, optional, up to 50 characters. */
  last_name?: string;
  /** Customer's password (up to 50 characters). If not provided, Foxy will generate a random password for this account server-side. */
  password?: string;
  /** Customer's email address (up to 100 characters), required. */
  email: string;
}

export interface Session {
  session_token: string;
  expires_in: number;
  jwt: string;
}

export interface StoredSession extends Session {
  date_created: string;
}
