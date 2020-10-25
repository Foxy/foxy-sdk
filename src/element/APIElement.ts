import { UserAPI } from "../AdminAPI";
import { ApiError } from "../error";
import { AuthError } from "../admin/auth";
import { CustomerAPI } from "../api/customer";
import { RequestEvent } from "./RequestEvent";

enum ReservedURI {
  SignIn = "foxy://sign-in",
  SignOut = "foxy://sign-out",
  ResetPassword = "foxy://reset-password",
}

type Rel = keyof typeof APIElement["rels"];

export class APIElement extends HTMLElement {
  public static readonly observedAttributes = ["href", "rel"];
  public static readonly defaultEndpoint = new URL("/s/admin", location.origin).toString();
  public static readonly defaultRel: Rel = "user";
  public static readonly rels = {
    customer: "customer",
    user: "user",
  };

  private __api!: UserAPI | CustomerAPI;

  public constructor() {
    super();

    this.addEventListener("request", (evt) =>
      (evt as RequestEvent).detail.handle((input, init) => {
        switch (input) {
          case ReservedURI.SignIn:
            return this.__handleSignIn(init);
          case ReservedURI.SignOut:
            return this.__handleSignOut(init);
          case ReservedURI.ResetPassword:
            return this.__handlePasswordReset(init);
          default:
            return this.__handleRequest(input, init);
        }
      })
    );

    this.__init();
  }

  public get href(): string {
    return this.getAttribute("href") ?? APIElement.defaultEndpoint;
  }
  public set href(newValue: string) {
    if (newValue !== this.href) this.setAttribute("href", newValue);
  }

  public get rel(): Rel {
    return (this.getAttribute("rel") as Rel) ?? APIElement.defaultRel;
  }
  public set rel(newValue: Rel) {
    if (newValue !== this.rel) this.setAttribute("rel", newValue);
  }

  public get api(): UserAPI | CustomerAPI {
    return this.__api;
  }

  public attributeChangedCallback(): void {
    this.__init();
  }

  private __init() {
    const config = {
      endpoint: this.href,
      storage: localStorage,
    };

    switch (this.rel) {
      case APIElement.rels.user:
        this.__api = new UserAPI(config);
        break;

      case APIElement.rels.customer:
        this.__api = new CustomerAPI(config);
        break;

      default:
        throw new Error(`Unknown rel ${this.rel}`);
    }
  }

  private async __handleSignIn(init?: RequestInit) {
    try {
      await this.__api.signIn(JSON.parse(init?.body?.toString() ?? "{}"));
      return new Response(null, { status: 200 });
    } catch (err) {
      const status = err instanceof AuthError ? err.code : 500;
      return new Response(null, { status });
    }
  }

  private async __handleSignOut(init?: RequestInit) {
    this.__api.signOut();
    return new Response(null, { status: 200 });
  }

  private async __handlePasswordReset(init?: RequestInit) {
    return new Response(null, { status: 500 }); // TODO
  }

  private async __handleRequest(input: RequestInfo, init?: RequestInit) {
    try {
      const json = await this.__api.fetchRaw({ url: input.toString(), ...init });
      return new Response(JSON.stringify(json), { status: 200 });
    } catch (err) {
      if (err instanceof ApiError) {
        return new Response(err.rawText, { status: err.status });
      } else {
        return new Response(String(err), { status: 500 });
      }
    }
  }
}
