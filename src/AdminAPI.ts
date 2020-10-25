import { AuthClass } from "@aws-amplify/auth/lib-esm/Auth";
import { fetch } from "cross-fetch";
import { BrowserAPI } from "./BrowserAPI";
import { BrowserAPICredentials, BrowserAPIParameters } from "./types/auth";
import { Graph } from "./types/integration";

export class AdminAPI extends BrowserAPI<Graph> {
  readonly auth: AuthClass;

  constructor(params: BrowserAPIParameters) {
    super(params);

    this.auth = new AuthClass({
      region: "us-east-2", // TODO: change to production value
      storage: params.storage,
      userPoolId: "us-east-2_2Vw7tMmLQ", // TODO: change to production value
      userPoolWebClientId: "2i58qs1u38kv605rm3v5t4dake", // TODO: change to production value
      identityPoolId: "us-east-2:6e3cb428-0e77-495e-9960-f4ab46d4dca1", // TODO: change to production value
    });
  }

  async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const session = await this.auth.currentSession().catch(() => null);
    const headers = new Headers(init?.headers);

    headers.set("Content-Type", "application/json");
    if (session !== null) headers.set("Authorization", `Bearer ${session.getAccessToken().getJwtToken()}`);

    return fetch(input, { ...init, headers });
  }

  async signIn(credentials: BrowserAPICredentials): Promise<void> {
    let user: any;

    try {
      user = await this.auth.signIn(credentials.email, credentials.password);
    } catch {
      throw { code: "Unauthorized" }; // TODO
    }

    if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
      if (credentials.newPassword) {
        const { requiredAttributes } = user.challengeParam;
        try {
          await this.auth.completeNewPassword(user, credentials.newPassword, requiredAttributes);
        } catch {
          throw { code: "Unknown" }; // TODO
        }
      } else {
        throw { code: "NewPasswordRequired" }; // TODO
      }
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await this.auth.forgotPassword(email);
    } catch {
      throw { code: "UnhandledException" }; // TODO
    }
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    this.storage.clear();
  }
}
