# Foxy SDK

This package is currently being updated to 2.0 and is in a WIP state.

## Current status

- Current focus: Checkout SDK (`@foxy.io/sdk/checkout`).
- Main package export is available (`@foxy.io/sdk`) and currently exposes Checkout.
- Tooling has been modernized around Vite + Vitest.

## Planned modules

The following SDK modules are not part of this WIP release yet and will be re-added later:

- Backend
- Customer
- Core

## Install

```bash
npm i @foxy.io/sdk
```

The type declarations need a bundler. They use extensionless relative imports, which TypeScript's `"moduleResolution": "node16"` and `"nodenext"` reject. Use `"moduleResolution": "bundler"`. A plain Node ESM project without a bundler cannot consume this package's types.

## Usage

```ts
import * as FoxySDK from "@foxy.io/sdk";
```

or:

```ts
import { API } from "@foxy.io/sdk/checkout";
```

The sidecart is a module-level singleton, imported the same way as the checkout
client. `?store=` is your store's domain and is required: the sidecart frames
the store over your own site, so it will not guess the store from the page it
is running on.

```js
import { sideCart } from "https://cdn-js.foxy.io/sdk@2/checkout/side-cart.js?store=example.foxycart.com";

sideCart.show();
sideCart.hide();
sideCart.addEventListener("itemcountchange", (event) => {
  // Render the new count every time -- `sideCart.itemCount` may be `null`
  // ("not known yet"), so a consumer should treat that as no badge rather
  // than a badge reading "null".
  renderBadge(sideCart.itemCount);

  // But only announce it to assistive tech when `corrected` is false. The
  // first report after the drawer connects corrects a stale cached count to
  // the truth -- the shopper did not cause that change, so `corrected` is
  // `true` and an aria-live region should stay quiet for it.
  if (!event.detail.corrected) announceToScreenReader(sideCart.itemCount);
});
```

`checkout/loader.js` reads the same `?store=` parameter from its own URL and
sets the domain on the shared client, so a page that already loads it can drop
the one on the sidecart import:

```js
import "https://cdn-js.foxy.io/sdk@2/checkout/loader.js?store=example.foxycart.com";
import { sideCart } from "https://cdn-js.foxy.io/sdk@2/checkout/side-cart.js";
```

Importing it also makes `client`'s cart mutations travel into the sidecart
iframe, which is the document that owns the session.

### Add-to-cart links and forms

Import this on the merchant's pages so add-to-cart links and forms reach the
visitor's own cart. It needs no markup changes.

```js
import "https://cdn-js.foxy.io/sdk@2/checkout/add-to-cart.js?store=example.foxycart.com";
```

For every link or form that points at the store's `/cart`:

* With `checkout/side-cart` imported, the item goes into the sidecart and the
  sidecart opens. Links that go on to checkout (`redirect=/checkout`, or
  `cart=checkout`) still navigate.
* Without it, the browser goes to the cart with the visitor's `session_id`.
  This keeps the visitor's session on a first click only once the store
  allows the merchant's origin (CORS). Until the store allows it, a first
  click with no session yet starts a new cart instead.
* The session id is added when the visitor clicks. It is never written into
  the page, so a copied link never carries it.
* A click that opens a new tab (a modifier key, the middle button, or a
  `target` other than `_self`) never uses the sidecart.
* `empty=reset` starts a new session.

For a custom cart, cancel the `foxy:add-to-cart` event and use the detail:

```js
document.addEventListener("foxy:add-to-cart", (event) => {
  event.preventDefault();
  const { url, params, sessionId } = event.detail;
  // your own cart code
});
```

### Cart session

`client.session` holds the visitor's cart session ID. By default it is kept
in `localStorage` and a new session starts when there is none.

```js
import { client } from "https://cdn-js.foxy.io/sdk@2/checkout/loader.js?store=example.foxycart.com";

client.session.configure({
  storage: "cookie", // "local" (default), "session", "cookie", "memory", or your own store
  key: "fc_sid",     // default: "foxy.session.<store host>"
  cookie: { domain: ".example.com", maxAge: 2592000 }, // cookie only
});
```

Without `maxAge`, the cookie ends when the browser session ends.

Call `configure()` right after the import, in the same script. The first
cart request waits until the current script finishes.

If a setting must apply before the first cart request, import
`checkout/client` instead. This applies to `"memory"`, `autoStart: false`,
and a store that reads from your backend. Configure first, then set the
domain.

Your own store has three methods. Each may return a promise:

```js
import { client } from "https://cdn-js.foxy.io/sdk@2/checkout/client.js";

const myStore = {
  get: () => fetch("/my-api/cart-session").then((r) => r.text()),
  set: (id) => fetch("/my-api/cart-session", { method: "PUT", body: id }),
  remove: () => fetch("/my-api/cart-session", { method: "DELETE" }),
};

client.session.configure({ storage: myStore });
client.setStoreDomain("example.foxycart.com");
```

If `get()` never settles, the cart never loads. Add your own timeout.

If `configure()` runs after the first request, the session moves to the new
store and the old store is emptied. One extra session may then exist on the
server.

With the default key, each store gets its own key. A `key` you set, or your
own store, holds one session, so use it with one store per page.

Importing `checkout/side-cart.js?store=...` or `checkout/add-to-cart.js?store=...`
without the loader also sets the store, if no store is set yet. It then
loads the session when the current script finishes, the same as the loader.
With the default `autoStart`, that creates a session for every visitor. Set
`autoStart: false` to wait for the first cart action.

The store must allow your site's origin on `/cart` (CORS). Stores will allow
two origins: the store's own domain, and the exact origin of the website URL
in the store settings. `example.com` and `www.example.com` are different
origins, and so is a staging site. While the store does not allow your
origin, the first cart request fails, and pages that load the session
themselves report one error per page load.

Start and end sessions:

```js
await client.session.start();          // a new, empty session
await client.session.start("abc123");  // a session ID you already have
await client.session.end();            // forget it here; the cart stays on the server
await client.session.end({ reset: true }); // also empty it on the server
```

The session ID gives access to the cart. Keep it as private as a login
cookie:

* JavaScript cannot set `HttpOnly`, so any script on the page can read the
  cookie. If you set `domain`, scripts on every matching subdomain can read
  it too.
* The cookie is `SameSite=Lax` by default, and `Secure` on https: pages.
* Do not take a session ID from a URL parameter. A link could then put a
  visitor into someone else's cart.

## Development

```bash
npm i
npm test
npm run test:watch
npm run build:npm
npm run build:cdn
```
