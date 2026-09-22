// src/checkout/side-cart/origin.ts
import { resolveBaseUrlFromStoreDomain } from "../API";
import { client } from "../client";

/**
 * The store origin a module on the MERCHANT's page talks to, or null when
 * there is none. Shared by `side-cart.ts` and `add-to-cart.ts`.
 *
 * There are exactly two sources, both explicit: `client.storeUrl` and the
 * calling module's own `?store=` (pass its `import.meta.url`). There is
 * deliberately no `location.hostname` fallback -- `checkout/loader.ts` can
 * afford one because a store-hosted page's hostname IS the store, but these
 * modules run on the merchant's page, where by definition it is not.
 *
 * Resolved through `URL(...).origin` rather than a trailing-slash strip:
 * callers compare this with `event.origin` / `URL.origin`, which are always
 * lowercase and drop a default port, so a merchant-supplied domain in another
 * case or with an explicit `:443` still matches the page's own origin.
 *
 * Resolving to this page's own origin means no store was supplied at all. It
 * gets here through `client.storeUrl`, where it looks explicit:
 * `checkout/loader.ts` sets the domain from its own `location.hostname`
 * fallback when it is loaded without `?store=`. A store on a subdomain of
 * the same site is a different origin and still works.
 *
 * May throw: `resolveBaseUrlFromStoreDomain` does for a domain it cannot
 * resolve.
 */
export function resolveHostStoreOrigin(scriptUrl: string): string | null {
  const fromScript = new URL(scriptUrl).searchParams.get("store");
  const baseUrl =
    client.storeUrl ??
    (fromScript === null ? null : resolveBaseUrlFromStoreDomain(fromScript));

  if (baseUrl === null) return null;

  const origin = new URL(baseUrl).origin;
  return origin === location.origin ? null : origin;
}
