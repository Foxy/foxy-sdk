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
client:

```js
import { sideCart } from "https://cdn-js.foxy.io/sdk@2/checkout/side-cart.js";

sideCart.show();
sideCart.hide();
sideCart.addEventListener("itemcountchange", () => console.log(sideCart.itemCount));
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
