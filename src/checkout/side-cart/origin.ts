import { client } from "../client";
import { internalsOf } from "../internal";

/**
 * The store origin the sidecart and add-to-cart talk to on the MERCHANT's
 * page, or null when there is none.
 *
 * It comes from the client's store URL only. Resolving to this page's own
 * origin means this is the store's own page, or no store was supplied: the
 * loader falls back to `location.hostname` without `?store=`. Both mean there
 * is no other store to talk to. A store on a subdomain of the same site is a
 * different origin and still works.
 *
 * Resolved through `URL(...).origin` rather than a trailing-slash strip:
 * callers compare this with `event.origin` / `URL.origin`, which are always
 * lowercase and drop a default port, so a merchant-supplied domain in another
 * case or with an explicit `:443` still matches the page's own origin.
 */
export function resolveHostStoreOrigin(): string | null {
  const baseUrl = internalsOf(client).storeUrl();
  if (baseUrl === null) return null;

  const origin = new URL(baseUrl).origin;
  return origin === location.origin ? null : origin;
}
