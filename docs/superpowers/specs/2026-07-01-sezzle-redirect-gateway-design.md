---
name: sezzle-redirect-gateway
description: Refactor Sezzle from an SDK-loaded popup integration to a standard redirect gateway
metadata:
  type: project
---

# Sezzle Redirect Gateway Refactor

## Summary

Remove the Sezzle browser SDK integration from foxy-sdk and foxy-elements. Sezzle becomes a
standard redirect gateway — identical to `mollie_omnipay` in every frontend-observable way.
The backend owns the Sezzle session and handles the redirect; the frontend renders a branded
button, tokenizes with `{ requestId }`, and submits checkout.

This is a breaking change. Any consumer reading `api.sezzle` or expecting
`{ sezzle: { orderUuid } }` in the tokenize event payload must be updated.

## Scope

Repos affected: `foxy-sdk`, `foxy-elements`. `foxy-checkout` is out of scope but must be updated
separately to handle the changed tokenize payload.

---

## foxy-sdk

### Type system

**`PaymentGatewayConfig.ts`**
- Add `'sezzle'` to `StandardRedirectGateway`:
  ```ts
  export type StandardRedirectGateway = 'mollie_omnipay' | 'sezzle';
  ```
- Delete `SezzleGatewayConfig` type and remove it from the `PaymentGatewayConfig` union.
  `RedirectGatewayConfig = { type: StandardRedirectGateway }` covers sezzle automatically.

**`SezzleSdkInstance.ts`** — delete entirely.

**`types/index.ts`** — remove `SezzleSdkInstance` barrel export.

**`API.ts` `ResolvedIncomingApiState`** — remove `sezzle: SezzleSdkInstance | null` field.

### API class

Remove from `API.ts`:
- `import { initializeSezzleSdk } from "./utils/sezzle"`
- `import type { SezzleSdkInstance } from "./types"` (and from the re-export block)
- `#sezzle: SezzleSdkInstance | null` private field
- Sezzle SDK initialization block in `resolveIncomingApiState` (currently lines 252–275)
- `get sezzle(): SezzleSdkInstance | null` getter
- `sezzleChanged` tracking and `resolvedState.sezzle` assignment in `#applyResolvedState`

**`src/checkout/utils/sezzle.ts`** — delete entirely.

### Tests

- Delete `src/tests/checkout/sezzle-payment-options.test.ts`.
- Remove Sezzle fixture data and assertions from `src/tests/checkout/parallel-sdk-loading.test.ts`.

---

## foxy-elements

### Option building (`element.tsx`)

**`#buildOptionsForGateway`** — sezzle branch:
```ts
// Before: required public_key, read checkout_url / auth_only, built sezzle config sub-object
// After: identical to mollie_omnipay
if (gateway === "sezzle") {
  return [{ type: "sezzle", label: "", disabled, gateway }];
}
```

**`#buildOptionFromExternalOption`** — sezzle branch:
```ts
// Before: required public_key, built sezzle config sub-object
// After: identical to mollie branch
if (type === "sezzle") {
  return [{ id: optionId, type: "sezzle", label: "", gateway: gateway || undefined, disabled }];
}
```

### Tokenization (`element.tsx`)

Delete `#tokenizeSezzle()` method.

Delete the `if (selectedOption.sezzle) { … }` block in `tokenize()`.

Add `"sezzle"` to the `requestId` branch in `#createTokenizePayload`:
```ts
// Before
if (selectedOption.type === "mollie" || selectedOption.type === "generic") {
  return { requestId: crypto.randomUUID() };
}

// After
if (selectedOption.type === "mollie" || selectedOption.type === "sezzle" || selectedOption.type === "generic") {
  return { requestId: crypto.randomUUID() };
}
```

Delete the `if (selectedOption.sezzle) { … }` block in `#createTokenizePayload` (the one that
reads `orderUuid`).

### Types (`types.ts`)

Remove:
- `PaymentMethodSelectorSezzleConfig`
- `PaymentMethodSelectorSezzleTokenizePayload`
- `sezzle?: PaymentMethodSelectorSezzleConfig` from `PaymentMethodSelectorOption`
- `PaymentMethodSelectorSezzleTokenizePayload` from the `PaymentMethodSelectorTokenizePayload` union

### What stays

- `icons/sezzle.tsx` — brand icon unchanged
- `"sezzle"` in `BUTTON_CLICK_HINT_OPTION_TYPES` in `constants.ts` — unchanged
- Sezzle label/description entries in `messages.ts` — unchanged

### Scripts and examples

- Delete `scripts/init-sezzle-session.js`
- Delete `examples/default/sezzle.html`
- Delete `examples/custom/sezzle.html`

### Tests (`element.test.ts`)

Remove test cases that exercise the Sezzle SDK popup flow (SDK loading, popup open,
`onComplete`/`onCancel`/`onFailure` callbacks, `order_uuid` extraction).

---

## Breaking changes

| Consumer | Before | After |
|---|---|---|
| `api.sezzle` getter | Returns `SezzleSdkInstance \| null` | Property removed |
| Tokenize event payload | `{ sezzle: { orderUuid: string } }` | `{ requestId: string }` |
| `SezzleSdkInstance` type | Exported from `foxy-sdk` | Removed |
| `SezzleGatewayConfig` type | `{ type, public_key, checkout_url?, auth_only? }` | Covered by `RedirectGatewayConfig = { type: StandardRedirectGateway }` |

---

## What is NOT changing

- Backend Sezzle session creation logic
- The Sezzle branded button and icon in foxy-elements
- The "Buy Now, Pay Later with Sezzle" label and description
- How the backend handles the redirect to/from Sezzle's hosted checkout
