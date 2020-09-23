import AWSAuth from "@aws-amplify/auth";
import { CognitoUserSession } from "amazon-cognito-identity-js";
import MemoryStorage from "ministorage";
import { Auth } from "./types";

interface UserAuthParameters {
  /**
   * Storage provider to store access token and other temporary values with.
   * In-memory session storage is used by default.
   */
  storage?: Storage;

  /**
   * Allows changing the API endpoint. You'll most likely never need to use this option.
   * A value of the `FOXY_API_URL` env var will be used if found.
   * Default value is `https://api.foxycart.com`.
   */
  endpoint: string;
}

interface SignInCredentials {
  email: string;
  password: string;
  persistent: boolean;
  newPassword?: string;
}

enum AuthErrorType {
  NewPasswordRequired = 205,
  Unauthorized = 401,
  Unknown = 500,
}

export class AuthError {
  public code: AuthErrorType;
  constructor(code: AuthErrorType) {
    this.code = code;
  }
}

export class UserAuth implements Auth {
  private _storage: Storage;
  private _endpoint: string;

  constructor(params: UserAuthParameters) {
    const url = new URL(params.endpoint);
    url.pathname = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;

    this._storage = params.storage ?? new MemoryStorage();
    this._endpoint = url.toString();

    AWSAuth.configure({
      Auth: {
        region: "us-east-2",
        storage: this._storage,
        userPoolId: "us-east-2_2Vw7tMmLQ",
        userPoolWebClientId: "2i58qs1u38kv605rm3v5t4dake",
        identityPoolId: "us-east-2:6e3cb428-0e77-495e-9960-f4ab46d4dca1",
      },
    });
  }

  get endpoint() {
    return this._endpoint;
  }

  async fetch(input: string, init?: RequestInit): Promise<Response> {
    let session: CognitoUserSession;

    try {
      session = await AWSAuth.currentSession();
    } catch {
      return new Response(null, { status: 401 });
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.getAccessToken().getJwtToken()}`,
    };

    return await fetch(input, { ...init, headers: { ...init?.headers, ...headers } });
  }

  async signIn(credentials: SignInCredentials): Promise<void> {
    let user: any;

    try {
      user = await AWSAuth.signIn(credentials.email, credentials.password);
    } catch {
      throw new AuthError(AuthErrorType.Unauthorized);
    }

    if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
      if (credentials.newPassword) {
        const { requiredAttributes } = user.challengeParam;
        try {
          await AWSAuth.completeNewPassword(user, credentials.newPassword, requiredAttributes);
        } catch {
          throw new AuthError(AuthErrorType.Unknown);
        }
      } else {
        throw new AuthError(AuthErrorType.NewPasswordRequired);
      }
    }
  }

  async signOut(): Promise<void> {
    await AWSAuth.signOut();
  }
}
