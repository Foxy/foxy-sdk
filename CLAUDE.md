# Project Guidelines

## Maintain This File

- Update this file only when you discover stable, repo-specific conventions or development-process details that are not obvious from the codebase or standard tooling.
- Keep it minimal: prefer the smallest useful note, skip obvious/framework-default guidance, and do not add task-specific or temporary findings.

## What Is In This Branch

- `release/2.0.0` ships the **Checkout, Core and Customer** clients. `src/` holds
  `checkout/`, `core/`, `customer/` and `rules/`; `src/index.ts` re-exports the
  first three as namespaces.
- The Backend client has not been ported and neither has Nucleon. `BooleanSelector`,
  `Nucleon` and `Rumour` were deliberately left in v1 — do not assume a `Backend`
  namespace exists here, and check before referencing one.
- `src/rules/` is internal: it evaluates `customer_portal_settings` gating rules
  against the camelCase shapes the admin hAPI returns. `src/customer/` adapts the
  Customer API's snake_case settings onto it. It has no subpath and must not gain one.

## Testing

- `npm test` runs `vitest run`. Tests live in `src/tests/**/*.test.ts`, separate from the source, and are `environment: 'node'` with `globals: true` (no import of `describe`/`it`/`expect` needed).
- `npm run test:coverage` enforces 80% on branches, functions, lines and statements. Adding source without tests can fail the threshold even when every test passes.

## The Two Build Modes Are Not Interchangeable

`vite.config.ts` keys everything off `mode`:

- `build:npm` — dependencies stay **external**, and `vite-plugin-dts` emits types to `dist/npm`. This is what `prepack` runs.
- `build:cdn` — dependencies are **bundled and minified**, only Node builtins are external, and a `LICENSE.md` covering the bundled deps is emitted alongside.

A dependency that is fine for npm consumers is shipped to every browser in the CDN build. Weigh new runtime dependencies accordingly.

`jsonata` is pinned to `^1.8` on purpose: `evaluate()` is synchronous there and
returns a `Promise` in 2.x, which would force the three gating helpers in
`src/customer/` to become async and change their public signatures.

`dts()` runs with `rollupTypes: false`, `copyDtsFiles: true` and
`insertTypesEntry: true`, not with `rollupTypes: true`. The `core`/`customer`
type layer is ~44 hand-written `.d.ts` files; tsc does not re-emit declaration
inputs, so `@microsoft/api-extractor` never sees them and a rolled-up
`customer.d.ts` ends up full of unresolvable relative imports — which
`skipLibCheck` silently turns into `any`. See FX-274 notes before changing this.

Caveat that applies **only under `rollupTypes: true`**: with that setting, a tree
reached from `src/index.ts` but missing from the `dts()` `include` array fails the
build outright with `Internal Error: getResolvedModule() could not resolve module
name`. Under the committed `rollupTypes: false` it fails silently instead — see
Entry Points.

## Entry Points

`exports` in `package.json`, `entryMap` in `vite.config.ts`, the `include` array
in the `dts()` plugin call, and `include` in `tsconfig.build.json` are four
hand-maintained lists covering the same entries — `index`, `checkout`,
`checkout/client`, `checkout/loader`, `core`, `customer`. Adding an entry means
editing all four; nothing checks that they agree. Missing either of the last two
means **no emitted types rather than a build error**: `build:npm` still succeeds,
and `dist/npm/<entry>.d.ts` is emitted as a bare `export {}` with no declaration
tree behind it. Nothing surfaces until a consumer hits `TS2307`/`TS2305`.

`src/rules` appears in the last two lists but in neither of the first two — it is
internal, and `./customer` re-exports `getTimeFromFrequency` and `Constraints`
from it, so the emitted types need it.

- `checkout/client.ts` is a **singleton** — `export const client = new API()`. Importing it twice gives the same instance.
- `checkout/loader.ts` is the browser drop-in. It reads `?store=` from its own `import.meta.url` and falls back to `location.hostname`, then re-exports the same singleton. Anything that must run before first use belongs here, not in `client.ts`.

## Region Messages Are Generated

`src/checkout/locales/regions/*.json` is output from `npm run generate:regions` (`scripts/generate-region-messages.mjs`). The files carry no generated-file header, so they look hand-written — they are not. Edit the script, not the JSON.

## Validation

- All validators live in `src/checkout/v8n/` and are re-exported through `v8n/index.ts`. Add new ones there rather than inline in `API.ts`.
- `addressConfig.ts` holds the field lists (`SHIPPING_FIELDS`, `BILLING_FIELDS`, and the `*_BASE_REQUIRED_KEYS` sets) that the address validators read. Changing which fields are required is a change there, not in the validator.

## Public Surface

`src/checkout/index.ts` is the public API. It currently re-exports third-party SDK types (`AdyenEmbedded*`, `KlarnaSdkInstance`, `PayPalSdkInstance`, `GooglePaymentsClient`) — treat that as existing surface, not as licence to add more. Anything exported here is consumed by `foxy-elements` and `foxy-checkout`, and both externalize `@foxy.io/sdk/checkout*` in their CDN builds, so **removing an export breaks them at runtime rather than at build time**.

## Localdev

`npm run localdev:deploy:cdn` builds with `VITE_FOXYCART_DOMAIN=foxycart.test`, then `rm -rf`s and replaces `../foxy-docker-env-build/src/cdn-js/sdk@2`. It writes into a sibling repo — make sure that repo is where you expect before running it.
