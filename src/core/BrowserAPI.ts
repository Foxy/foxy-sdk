import MemoryStorage from "ministorage";
import { API, Graph } from "./index";

interface BrowserAPICredentials {
  email: string;
  password: string;
  newPassword?: string;
}

interface BrowserAPIParameters {
  storage?: Storage;
  baseURL: URL; // pathname ending with "/" !!!
  cache?: Storage;
}

abstract class BrowserAPI<TGraph extends Graph> extends API<TGraph> {
  constructor(params: BrowserAPIParameters) {
    super({
      storage: params.storage ?? new MemoryStorage(),
      baseURL: params.baseURL,
      fetch: (...args) => this.fetch(...args),
      cache: params.cache ?? new MemoryStorage(),
    });
  }

  abstract fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;

  abstract signIn(credentials: BrowserAPICredentials): Promise<void>;

  abstract sendPasswordResetEmail(email: string): Promise<void>;

  abstract signOut(): Promise<void>;
}

enum BrowserAPIAuthErrorCode {
  /** Credentials are valid, but the session can be created only after changing the current password. This usually happens after a server-side password reset has been initiated for security reasons. */
  NEW_PASSWORD_REQUIRED = "NEW_PASSWORD_REQUIRED",
  /** Credentials are invalid. That could mean empty or invalid email or password or otherwise incorrect auth data. */
  UNAUTHORIZED = "UNAUTHORIZED",
  /** Any other or internal error that interrupted authentication. */
  UNKNOWN = "UNKNOWN",
}

interface BrowserAPIAuthErrorParams {
  code: BrowserAPIAuthErrorCode;
  originalError?: any;
}

class BrowserAPIAuthError extends Error {
  readonly originalError?: any;
  readonly code: BrowserAPIAuthErrorCode;

  constructor({ code, originalError }: BrowserAPIAuthErrorParams) {
    super(`authentication failed with code ${code}`);

    this.originalError = originalError;
    this.code = code;
  }
}

export { BrowserAPIAuthErrorCode, BrowserAPICredentials, BrowserAPIParameters, BrowserAPIAuthError, BrowserAPI };
