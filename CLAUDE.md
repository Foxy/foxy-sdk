# Project Guidelines

## Maintain This File

- Update this file only when you discover stable, repo-specific conventions or development-process details that are not obvious from the codebase or standard tooling.
- Keep it minimal: prefer the smallest useful note, skip obvious/framework-default guidance, and do not add task-specific or temporary findings.

## What Is In This Branch

- `release/2.0.0` ships the **Checkout API only**. `src/` contains `checkout/` and nothing else; `src/index.ts` is a single re-export of it.
- The Backend and Customer clients, and `core/` (which holds Nucleon), still live in v1 and have not been ported. Do not assume a `Backend`, `Customer` or `core` namespace exists here — check before referencing one.

## Testing

- `npm test` runs `vitest run`. Tests live in `src/tests/**/*.test.ts`, separate from the source, and are `environment: 'node'` with `globals: true` (no import of `describe`/`it`/`expect` needed).
- `npm run test:coverage` enforces 80% on branches, functions, lines and statements. Adding source without tests can fail the threshold even when every test passes.

## The Two Build Modes Are Not Interchangeable

`vite.config.ts` keys everything off `mode`:

- `build:npm` — dependencies stay **external**, and `vite-plugin-dts` emits rolled-up types to `dist/npm`. This is what `prepack` runs.
- `build:cdn` — dependencies are **bundled and minified**, only Node builtins are external, and a `LICENSE.md` covering the bundled deps is emitted alongside.

A dependency that is fine for npm consumers is shipped to every browser in the CDN build. Weigh new runtime dependencies accordingly.

## Entry Points

`entryMap` in `vite.config.ts` and `exports` in `package.json` are two hand-maintained lists of the same four entries — `index`, `checkout`, `checkout/client`, `checkout/loader`. Adding an entry means editing both; nothing checks that they agree.

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
