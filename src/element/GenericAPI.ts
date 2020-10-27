import {
  BrowserAPI,
  BrowserAPIAuthError,
  BrowserAPIAuthErrorCode,
  BrowserAPICredentials,
  BrowserAPIParameters,
} from "../core/BrowserAPI";

import { Graph } from "../core/types";
import { ReservedURI } from "./APIElement";
import { RequestEvent } from "./RequestEvent";

type GenericAPIParams = BrowserAPIParameters & {
  element: HTMLElement;
};

export class GenericAPI<G extends Graph> extends BrowserAPI<G> {
  readonly element: HTMLElement;

  constructor({ element, ...params }: GenericAPIParams) {
    super(params);
    this.element = element;
  }

  async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    return RequestEvent.emit({ source: this.element, init: [input, init] });
  }

  async signIn(credentials: BrowserAPICredentials): Promise<void> {
    const response = await RequestEvent.emit({
      source: this.element,
      init: [ReservedURI.SignIn, { method: "POST", body: JSON.stringify(credentials) }],
    });

    if (!response.ok) {
      const is500 = response.status.toString().startsWith("5");
      const code = is500 ? BrowserAPIAuthErrorCode.UNKNOWN : BrowserAPIAuthErrorCode.UNAUTHORIZED;
      throw new BrowserAPIAuthError({ code });
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const response = await RequestEvent.emit({
      source: this.element,
      init: [ReservedURI.ResetPassword, { method: "POST", body: JSON.stringify({ email }) }],
    });

    if (!response.ok) throw new BrowserAPIAuthError({ code: BrowserAPIAuthErrorCode.UNKNOWN });
  }

  async signOut(): Promise<void> {
    const response = await RequestEvent.emit({
      source: this.element,
      init: [ReservedURI.SignOut, { method: "POST" }],
    });

    if (!response.ok) throw new BrowserAPIAuthError({ code: BrowserAPIAuthErrorCode.UNKNOWN });
  }
}
