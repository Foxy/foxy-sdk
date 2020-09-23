import { Sender, SendRawInit } from "./sender";
import { Follower } from "./follower";
import { Auth } from "./auth/types";

export class API<TAuth extends Auth> {
  private _targets: EventTarget[] = [];
  private _listeners: EventListener[] = [];

  constructor(protected _auth: TAuth) {}

  /**
   * Makes JSON response object followable.
   *
   * @example
   *
   * const store = { _links: { "fx:attributes": { href: "https://api.foxy..." } } };
   * const link = foxy.from(store).follow("fx:attributes");
   *
   * // typescript users: specify resource location in the graph for better autocompletion
   * const link = foxy.from<FoxyApiGraph["fx:store"]>(...);
   *
   * @param resource partial response object with the `_links` property containing relations you'd like to follow
   */
  from(resource: any) {
    return new Follower<any, any, TAuth>(this._auth, [], resource._links.self.href);
  }

  /**
   * Starts building a resource URL from the root level. For the list of relations please refer to the
   * {@link https://api.foxycart.com/hal-browser/index.html link relationships} page.
   *
   * @example
   *
   * const link = foxy.follow("fx:store").follow("fx:attributes");
   *
   * @param key any root relation
   */
  follow(key: any) {
    return new Follower<any, any, TAuth>(this._auth, [key], this._auth.endpoint);
  }

  /**
   * Makes an API request to the specified URL, skipping the path construction
   * and resolution. This is what `.fetch()` uses under the hood. Before calling
   * this method, consider using a combination of `foxy.from(resource).fetch()`
   * or `foxy.follow(...).fetch()` instead.
   *
   * @example
   *
   * const response = await foxy.fetchRaw({
   *   url: "https://api.foxycart.com/stores",
   *   method: "POST",
   *   body: { ... }
   * });
   *
   * // typescript users: provide relation name to get a better response type
   * const response = await foxy.fetchRaw<"fx:stores">(...)
   *
   * @param init fetch-like request initializer supporting url, method and body params
   */
  fetchRaw(init: SendRawInit<any>) {
    return new Sender<any, any, TAuth>(this._auth, [], this._auth.endpoint).fetchRaw(init);
  }

  signIn(...args: Parameters<TAuth["signIn"]>): Promise<void> {
    return this._auth.signIn(...args);
  }

  signOut(): void {
    return this._auth.signOut();
  }
}
