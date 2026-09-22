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

## Development

```bash
npm i
npm test
npm run test:watch
npm run build:npm
npm run build:cdn
```
