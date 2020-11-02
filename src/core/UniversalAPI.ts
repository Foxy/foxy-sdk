import { API } from './internal';
import { APIGraph } from './types';

/** User credentials for authentication. */
export interface UniversalAPICredentials {
  /** Email address associated with an account. */
  email: string;
  /** Current password during regular sign-in, temporary password or a one-time code during access recovery. */
  password: string;
  /** New password (only needed during the access recovery or force reset). */
  newPassword?: string;
}

/**
 * This is an abstract class that defines a common interface for all
 * universal API clients. Unlike server-side-only clients, the universal ones
 * must implement a number of methods to ensure that they can be used effortlessly
 * with the `<foxy-api>` element from `@foxy.io/elements`.
 */
export abstract class UniversalAPI<TGraph extends APIGraph> extends API<TGraph> {
  /**
   * Authenticates a user based on the provided credentials. Child classes
   * must implement this method to support authentication.
   *
   * @param credentials Email, password and optionally new password.
   * @throws {UniversalAPIAuthError}
   */
  abstract signIn(credentials: UniversalAPICredentials): Promise<void>;

  /**
   * Initiates password recovery process by sending a password reset
   * email to the provided address. The user might receive a one-time
   * code or a temporary password as a result – implementation details
   * may vary. Child classes must implement this method to support authentication.
   *
   * @param email Email address to send the password reset email to.
   * @throws {UniversalAPIAuthError}
   */
  abstract sendPasswordResetEmail(email: string): Promise<void>;

  /**
   * Signs out the active user, wiping all related info from the device. Child classes
   * must implement this method to support authentication.
   *
   * @throws {UniversalAPIAuthError}
   */
  abstract signOut(): Promise<void>;
}
