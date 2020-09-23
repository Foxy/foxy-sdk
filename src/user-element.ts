import { UserAPI } from "./user";
import { ApiError } from "./error";
import { AuthError } from "./auth/user";

type RequestEvent = CustomEvent<{
  source: HTMLElement;
  handle: (fetch: Window["fetch"]) => Promise<void>;
}>;

class UserAPIElement extends HTMLElement {
  public static get observedAttributes() {
    return ["endpoint"];
  }

  private __defaultEndpoint = new URL("/s/admin", location.origin).toString();
  private __api = new UserAPI({
    endpoint: this.__defaultEndpoint,
    storage: localStorage,
  });

  constructor() {
    super();

    this.addEventListener("request", (evt) => {
      (evt as RequestEvent).detail.handle(async (input, init) => {
        if (input === "foxy://sign-in") {
          try {
            await this.__api.signIn(JSON.parse(init?.body?.toString() ?? "{}"));
            return new Response(null, { status: 200 });
          } catch (err) {
            const status = err instanceof AuthError ? err.code : 500;
            return new Response(null, { status });
          }
        }

        if (input === "foxy://sign-out") {
          this.__api.signOut();
          return new Response(null, { status: 200 });
        }

        if (input === "foxy://reset-password") {
          // TODO
        }

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
      });
    });
  }

  public attributeChangedCallback(name: string, _: unknown, newValue: string | null) {
    if (name === "endpoint") {
      this.__api = new UserAPI({
        endpoint: newValue ?? this.__defaultEndpoint,
        storage: localStorage,
      });
    }
  }
}

customElements.define("user-api", UserAPIElement);
