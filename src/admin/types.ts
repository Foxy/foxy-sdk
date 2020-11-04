/** User credentials for authentication. */
export interface Credentials {
  /** Email address associated with an account. */
  email: string;
  /** Current password during regular sign-in, temporary password or a one-time code during access recovery. */
  password: string;
  /** New password (only needed during the access recovery or force reset). */
  newPassword?: string;
}
