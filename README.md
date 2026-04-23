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

## Development

```bash
npm i
npm test
npm run test:watch
npm run build:npm
npm run build:cdn
```
