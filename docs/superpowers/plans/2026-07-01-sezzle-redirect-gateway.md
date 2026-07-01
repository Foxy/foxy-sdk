# Sezzle Redirect Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Sezzle browser SDK integration from foxy-sdk and foxy-elements; make Sezzle behave identically to `mollie_omnipay` (a standard redirect gateway) at every layer.

**Architecture:** `"sezzle"` is added to the `StandardRedirectGateway` union in foxy-sdk, making it a first-class redirect type with no frontend-specific SDK loading or tokenization logic. foxy-elements maps the sezzle gateway to a branded button option and returns `{ requestId }` on tokenize — the same shape as mollie.

**Tech Stack:** TypeScript, Vitest (foxy-sdk: `npm test`; foxy-elements: `npx vitest run --project unit`)

## Global Constraints

- Do NOT add any new Sezzle-specific logic; every change is a net deletion or simplification.
- After every task, the TypeScript compiler and test suite must pass.
- Keep `icons/sezzle.tsx` and Sezzle labels/descriptions in `messages.ts` — only SDK and type plumbing is removed.
- All paths are absolute. foxy-sdk root: `/Users/pheekus/FoxyCommerce/foxy-sdk`. foxy-elements root: `/Users/pheekus/FoxyCommerce/foxy-elements`.

---

## Task 1: foxy-sdk — Remove Sezzle gateway and SDK types

**Files:**
- Modify: `src/checkout/types/PaymentGatewayConfig.ts`
- Delete: `src/checkout/types/SezzleSdkInstance.ts`
- Modify: `src/checkout/types/index.ts`

**Interfaces:**
- Produces: `StandardRedirectGateway = 'mollie_omnipay' | 'sezzle'`; `SezzleGatewayConfig` removed from `PaymentGatewayConfig` union; `SezzleSdkInstance` no longer barrel-exported.

- [ ] **Step 1: Add sezzle to `StandardRedirectGateway` and delete `SezzleGatewayConfig`**

In `src/checkout/types/PaymentGatewayConfig.ts`:

Replace line 23:
```typescript
export type StandardRedirectGateway = 'mollie_omnipay';
```
With:
```typescript
export type StandardRedirectGateway = 'mollie_omnipay' | 'sezzle';
```

Delete the entire `SezzleGatewayConfig` type block (lines 116–125):
```typescript
type SezzleGatewayConfig = {
  /** Gateway identifier. */
  type: "sezzle";
  /** Used when creating a checkout or capturing payment. Find your API keys at https://dashboard.sezzle.com/merchant/settings/apikeys. */
  public_key: string;
  /** Backend-created Sezzle checkout session URL. When present, tokenize() will open the Sezzle checkout popup and return an order_uuid. */
  checkout_url?: string;
  /** When true, the backend created the session in AUTH_ONLY mode; capture must be triggered separately. */
  auth_only?: boolean;
};
```

Remove `| SezzleGatewayConfig` from the `PaymentGatewayConfig` union (was line 162):
```typescript
export type PaymentGatewayConfig =
  | StandardCardPaymentGatewayConfig
  | StandardAchPaymentGatewayConfig
  | RedirectGatewayConfig
  | StripeCardElementGatewayConfig
  | StripePaymentElementGatewayConfig
  | PayPalPlatformGatewayConfig
  | KlarnaGatewayConfig
  | SezzleGatewayConfig
  | AdyenEmbeddedGatewayConfig
  | SquareUpGatewayConfig;
```
Should become:
```typescript
export type PaymentGatewayConfig =
  | StandardCardPaymentGatewayConfig
  | StandardAchPaymentGatewayConfig
  | RedirectGatewayConfig
  | StripeCardElementGatewayConfig
  | StripePaymentElementGatewayConfig
  | PayPalPlatformGatewayConfig
  | KlarnaGatewayConfig
  | AdyenEmbeddedGatewayConfig
  | SquareUpGatewayConfig;
```

- [ ] **Step 2: Delete `SezzleSdkInstance.ts`**

```bash
rm /Users/pheekus/FoxyCommerce/foxy-sdk/src/checkout/types/SezzleSdkInstance.ts
```

- [ ] **Step 3: Remove the barrel export in `types/index.ts`**

Delete line 27 from `src/checkout/types/index.ts`:
```typescript
export type { SezzleSdkInstance } from "./SezzleSdkInstance";
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk && npx tsc --noEmit
```

Expected: Only errors in `API.ts` (which still imports deleted types). Other files clean.

- [ ] **Step 5: Commit**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk && git add src/checkout/types/PaymentGatewayConfig.ts src/checkout/types/index.ts && git rm src/checkout/types/SezzleSdkInstance.ts && git commit -m "feat: add sezzle to StandardRedirectGateway, remove SezzleGatewayConfig and SezzleSdkInstance types"
```

---

## Task 2: foxy-sdk — Strip Sezzle from API class and delete utils

**Files:**
- Modify: `src/checkout/API.ts`
- Delete: `src/checkout/utils/sezzle.ts`

**Interfaces:**
- `ResolvedIncomingApiState` no longer has `sezzle` field.
- `API` class no longer has `#sezzle` field or `get sezzle()` getter.
- `CheckOutPaymentOption` no longer has the `{ gateway: "sezzle"; order_uuid: string }` variant (covered by `{ gateway: StandardRedirectGateway }`).

- [ ] **Step 1: Remove `SezzleSdkInstance` import from `API.ts`**

At the top of `src/checkout/API.ts`, the first import block (lines 1–12) includes `SezzleSdkInstance`. Remove it:

```typescript
import type {
  AdyenEmbeddedAmount,
  AdyenEmbeddedSdkInstance,
  APIEventMap,
  APIJson,
  CustomFields,
  GooglePaymentsClient,
  KlarnaSdkInstance,
  PayPalSdkInstance,
  SezzleSdkInstance,
  SquareSdkInstance,
} from "./types";
```
Becomes:
```typescript
import type {
  AdyenEmbeddedAmount,
  AdyenEmbeddedSdkInstance,
  APIEventMap,
  APIJson,
  CustomFields,
  GooglePaymentsClient,
  KlarnaSdkInstance,
  PayPalSdkInstance,
  SquareSdkInstance,
} from "./types";
```

- [ ] **Step 2: Remove the `initializeSezzleSdk` import**

Delete line 37:
```typescript
import { initializeSezzleSdk } from "./utils/sezzle";
```

- [ ] **Step 3: Remove `sezzle` from `ResolvedIncomingApiState`**

The type at lines 64–71:
```typescript
type ResolvedIncomingApiState = {
  json: MutableAPIJson;
  adyenEmbedded: AdyenEmbeddedSdkInstance | null;
  paypal: PayPalSdkInstance | null;
  klarna: KlarnaSdkInstance | null;
  sezzle: SezzleSdkInstance | null;
  square: SquareSdkInstance | null;
};
```
Becomes:
```typescript
type ResolvedIncomingApiState = {
  json: MutableAPIJson;
  adyenEmbedded: AdyenEmbeddedSdkInstance | null;
  paypal: PayPalSdkInstance | null;
  klarna: KlarnaSdkInstance | null;
  square: SquareSdkInstance | null;
};
```

- [ ] **Step 4: Remove the local `sezzle` variable and Sezzle SDK init block in `resolveIncomingApiState`**

In `resolveIncomingApiState` (lines 177–345):

Remove the variable declaration (line 185):
```typescript
  let sezzle: SezzleSdkInstance | null = null;
```

Remove `sezzle,` from the intermediate `onPayPalResolved` call (lines 220–227):
```typescript
  options.onPayPalResolved?.({
    json: nextJson,
    adyenEmbedded,
    paypal,
    klarna,
    sezzle,
    square,
  });
```
Becomes:
```typescript
  options.onPayPalResolved?.({
    json: nextJson,
    adyenEmbedded,
    paypal,
    klarna,
    square,
  });
```

Remove the entire Sezzle SDK initialization block (lines 252–275):
```typescript
  const sezzleConfig = getFirstPaymentGatewayConfig(nextJson, "sezzle");

  if (sezzleConfig) {
    if (!isBrowserEnvironment) {
      console.warn(
        "Sezzle SDK was not initialized because checkout API JSON was processed outside a browser environment.",
      );
    } else {
      thirdPartySdkTasks.push(
        initializeSezzleSdk({
          publicKey: sezzleConfig.public_key,
          customConfig: nextJson.custom_config,
        })
          .then((instance) => {
            sezzle = instance;
          })
          .catch(() => {
            console.warn(
              "Sezzle SDK was not initialized because the Sezzle SDK could not be loaded.",
            );
          }),
      );
    }
  }
```
(Delete the entire block — no replacement.)

Remove `sezzle,` from the function return value (line 342):
```typescript
  return {
    json: nextJson,
    adyenEmbedded,
    paypal,
    klarna,
    sezzle,
    square,
  };
```
Becomes:
```typescript
  return {
    json: nextJson,
    adyenEmbedded,
    paypal,
    klarna,
    square,
  };
```

- [ ] **Step 5: Remove the sezzle-specific `CheckOutPaymentOption` variant**

In `CheckOutPaymentOption` (lines 347–397), remove this variant (lines 374–376):
```typescript
  | {
      gateway: "sezzle";
      order_uuid: string;
    }
```
It is covered by the existing `{ gateway: StandardRedirectGateway }` variant which now includes `"sezzle"`.

- [ ] **Step 6: Remove `#sezzle` private field from the `API` class**

In the class field declarations (around line 426), remove:
```typescript
  #sezzle: SezzleSdkInstance | null;
```

- [ ] **Step 7: Remove `this.#sezzle = null` from the constructor**

The constructor has two branches; both initialize `#sezzle`. Remove both occurrences:
```typescript
      this.#sezzle = null;
```
(Two occurrences around lines 481 and 490 — remove both.)

- [ ] **Step 8: Remove `get sezzle()` getter**

Delete these three lines (around line 567–569):
```typescript
  get sezzle(): SezzleSdkInstance | null {
    return this.#sezzle;
  }
```

- [ ] **Step 9: Remove sezzle tracking from `#applyResolvedState`**

In `#applyResolvedState` (lines 647–686):

Remove the `sezzleChanged` declaration (line 660):
```typescript
    const sezzleChanged = this.#sezzle !== resolvedState.sezzle;
```

Remove the `this.#sezzle` assignment (line 667):
```typescript
    this.#sezzle = resolvedState.sezzle;
```

Remove `sezzleChanged ||` from the update condition (line 681). The full condition was:
```typescript
      (previousJson !== nextResolvedJson ||
        stateChanged ||
        adyenEmbeddedChanged ||
        klarnaChanged ||
        paypalChanged ||
        sezzleChanged ||
        squareChanged)
```
Becomes:
```typescript
      (previousJson !== nextResolvedJson ||
        stateChanged ||
        adyenEmbeddedChanged ||
        klarnaChanged ||
        paypalChanged ||
        squareChanged)
```

- [ ] **Step 10: Delete `utils/sezzle.ts`**

```bash
rm /Users/pheekus/FoxyCommerce/foxy-sdk/src/checkout/utils/sezzle.ts
```

- [ ] **Step 11: Verify TypeScript compiles cleanly**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk && npx tsc --noEmit
```

Expected: Zero errors.

- [ ] **Step 12: Commit**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk && git add src/checkout/API.ts && git rm src/checkout/utils/sezzle.ts && git commit -m "feat: remove Sezzle SDK initialization and API class getter"
```

---

## Task 3: foxy-sdk — Update tests

**Files:**
- Delete: `src/tests/checkout/sezzle-payment-options.test.ts`
- Modify: `src/tests/checkout/parallel-sdk-loading.test.ts`

- [ ] **Step 1: Delete the Sezzle-specific test file**

```bash
rm /Users/pheekus/FoxyCommerce/foxy-sdk/src/tests/checkout/sezzle-payment-options.test.ts
```

- [ ] **Step 2: Update `parallel-sdk-loading.test.ts`**

This file tests that third-party SDKs (PayPal, Adyen, Klarna, Sezzle) load in parallel. After the refactor Sezzle is a redirect gateway — no SDK loads. Remove all Sezzle SDK mock machinery and update the test to verify Sezzle does NOT trigger SDK loading.

**Remove the `sezzleSdk` mock object** (lines 48–54):
```typescript
  const sezzleSdk = {
    init: vi.fn(),
    startCheckout: vi.fn(),
    renderSezzleButton: vi.fn(),
    capturePayment: vi.fn(),
    getInstallmentPlan: vi.fn(),
  };
```

**Remove `sezzleDeferred` and `initializeSezzleSdk` from `state`** — remove these entries from the `state` object:
```typescript
    sezzleDeferred: createDeferred<unknown>(),
```
```typescript
    sezzleSdk,
```
```typescript
    initializeSezzleSdk: vi.fn(() => state.sezzleDeferred.promise),
```

**Remove these lines from the `reset()` method:**
```typescript
      state.sezzleDeferred = createDeferred<unknown>();
```
```typescript
      state.initializeSezzleSdk.mockClear();
```
```typescript
      state.sezzleSdk.init.mockClear();
      state.sezzleSdk.startCheckout.mockClear();
      state.sezzleSdk.renderSezzleButton.mockClear();
      state.sezzleSdk.capturePayment.mockClear();
      state.sezzleSdk.getInstallmentPlan.mockClear();
```

**Remove the `vi.mock` for sezzle utils** (lines 137–139):
```typescript
vi.mock("../../checkout/utils/sezzle", () => ({
  initializeSezzleSdk: mocks.initializeSezzleSdk,
}));
```

**Update `sezzleOption` fixture** (lines 182–185) — it now has no `public_key` since Sezzle is a redirect gateway:
```typescript
const sezzleOption = {
  type: "sezzle",
  public_key: "sezzle-public-key",
} as const;
```
Becomes:
```typescript
const sezzleOption = {
  type: "sezzle",
} as const;
```

**Update the test body** — the test currently asserts `initializeSezzleSdk` was called once and `api.sezzle` is populated. After the refactor, neither happens. Replace the test body with the following (fully replacing the `it("loads third-party SDKs in parallel...")` block):

```typescript
  it("loads third-party SDKs in parallel after PayPal initialization settles", async () => {
    const api = await createTestApi();
    const replacePromise = api.replaceJsonForTesting(
      createApiJson({
        saved_payment_methods: [savedCardOption],
        payment_gateways: [
          payPalGatewayConfigOne,
          sezzleOption,
          adyenGatewayConfig,
          payPalGatewayConfigTwo,
          authorizeGatewayConfig,
        ],
      }),
    );
    let didReplaceResolve = false;

    void replacePromise.then(() => {
      didReplaceResolve = true;
    });

    await flushTasks();

    expect(mocks.loadPayPalSdk).toHaveBeenCalledTimes(2);
    expect(mocks.payPalCalls).toEqual([
      payPalOptionOne.client_id,
      payPalOptionTwo.client_id,
    ]);
    expect(api.json).toBeNull();
    expect(api.paypal).toBeNull();
    expect(mocks.initializeAdyenEmbeddedSdk).not.toHaveBeenCalled();
    expect(mocks.initializeKlarnaSdk).not.toHaveBeenCalled();
    expect(mocks.loadApplePaySdk).not.toHaveBeenCalled();
    expect(mocks.loadGooglePaySdk).not.toHaveBeenCalled();
    expect(didReplaceResolve).toBe(false);

    mocks.payPalDeferreds[0]?.resolve(mocks.payPalSdk);
    mocks.payPalDeferreds[1]?.resolve(null);

    await vi.waitFor(() => {
      expect(mocks.initializeAdyenEmbeddedSdk).toHaveBeenCalledTimes(1);
      expect(mocks.initializeKlarnaSdk).not.toHaveBeenCalled();
      expect(api.json?.saved_payment_methods).toEqual([savedCardOption]);
      expect(api.json?.payment_gateways).toEqual([
        payPalGatewayConfigOne,
        sezzleOption,
        adyenGatewayConfig,
        payPalGatewayConfigTwo,
        authorizeGatewayConfig,
      ]);
      expect(api.paypal).toBe(mocks.payPalSdk);
    });
    expect(mocks.loadApplePaySdk).not.toHaveBeenCalled();
    expect(mocks.loadGooglePaySdk).not.toHaveBeenCalled();
    expect(api.adyenEmbedded).toBeNull();
    expect(didReplaceResolve).toBe(false);

    mocks.adyenDeferred.resolve(mocks.adyenSdk);
    mocks.applePayDeferred.resolve();
    mocks.googlePayDeferred.resolve();

    await replacePromise;

    expect(api.adyenEmbedded).toBe(mocks.adyenSdk);
    expect(api.paypal).toBe(mocks.payPalSdk);
    expect(api.klarna).toBeNull();
    expect(api.json?.saved_payment_methods).toEqual([savedCardOption]);
    expect(api.json?.payment_gateways).toEqual([
      payPalGatewayConfigOne,
      sezzleOption,
      adyenGatewayConfig,
      payPalGatewayConfigTwo,
      authorizeGatewayConfig,
    ]);
  });
```

- [ ] **Step 3: Run foxy-sdk tests**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk && npm test
```

Expected: All tests pass. No reference to `initializeSezzleSdk` or `api.sezzle`.

- [ ] **Step 4: Commit**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-sdk && git rm src/tests/checkout/sezzle-payment-options.test.ts && git add src/tests/checkout/parallel-sdk-loading.test.ts && git commit -m "test: remove Sezzle SDK tests, update parallel-loading test for redirect gateway"
```

---

## Task 4: foxy-elements — Remove Sezzle types

**Files:**
- Modify: `src/elements/foxy-payment-method-selector/types.ts`

**Interfaces:**
- Removes: `PaymentMethodSelectorSezzleConfig`, `PaymentMethodSelectorSezzleTokenizePayload`, `sezzle?` field on `PaymentMethodSelectorOption`.
- `PaymentMethodSelectorTokenizePayload` union drops the sezzle variant; `PaymentMethodSelectorRedirectTokenizePayload` covers Sezzle.

- [ ] **Step 1: Delete `PaymentMethodSelectorSezzleConfig`**

Remove lines 21–25 from `src/elements/foxy-payment-method-selector/types.ts`:
```typescript
export type PaymentMethodSelectorSezzleConfig = {
  publicKey: string;
  checkoutUrl?: string;
  authOnly?: boolean;
};
```

- [ ] **Step 2: Delete `PaymentMethodSelectorSezzleTokenizePayload`**

Remove lines 113–117:
```typescript
export type PaymentMethodSelectorSezzleTokenizePayload = {
  sezzle: {
    orderUuid: string;
  };
};
```

- [ ] **Step 3: Remove it from the `PaymentMethodSelectorTokenizePayload` union**

In the union (lines 192–207), remove:
```typescript
  | PaymentMethodSelectorSezzleTokenizePayload
```

- [ ] **Step 4: Remove `sezzle?` from `PaymentMethodSelectorOption`**

In `PaymentMethodSelectorOption` (lines 221–261), remove:
```typescript
  sezzle?: PaymentMethodSelectorSezzleConfig;
```

- [ ] **Step 5: Verify TypeScript (foxy-elements)**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements && npx tsc --noEmit
```

Expected: Errors only in `element.tsx` (still references removed types). Other files clean.

- [ ] **Step 6: Commit**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements && git add src/elements/foxy-payment-method-selector/types.ts && git commit -m "feat: remove Sezzle-specific tokenize payload and option config types"
```

---

## Task 5: foxy-elements — Simplify element.tsx

**Files:**
- Modify: `src/elements/foxy-payment-method-selector/element.tsx`

**Interfaces:**
- `CheckoutApiLike` no longer has `sezzle?`.
- `#buildOptionsForGateway` for `gateway === "sezzle"` returns `[{ type: "sezzle", gateway }]` — no config sub-object.
- `#createNormalizedOption` for `type === "sezzle"` returns `[{ id, type: "sezzle", label: "", gateway, disabled }]` — matches the mollie pattern.
- `#tokenizeSezzle` method is deleted.
- The `if (selectedOption.sezzle)` block in `tokenize()` is deleted.
- `#createTokenizePayload` adds `"sezzle"` to the `requestId` branch.
- The `if (selectedOption.sezzle)` block in `#createTokenizePayload` is deleted.

- [ ] **Step 1: Remove `sezzle?` from `CheckoutApiLike`**

In the `CheckoutApiLike` type (around line 49–60), remove:
```typescript
  sezzle?: unknown;
```

- [ ] **Step 2: Remove the sezzle tokenize branch from `tokenize()`**

In the `tokenize()` method, remove this entire block (lines 276–293):
```typescript
      if (selectedOption.sezzle) {
        this.#setLoading(true);
        const tokenized = await this.#tokenizeSezzle(selectedOption);
        const payload = this.#createTokenizePayload(selectedOption, tokenized);

        this.dispatchEvent(
          new CustomEvent<PaymentMethodSelectorTokenizationSuccessEventDetail>(
            paymentMethodSelectorEvents.tokenizationSuccess,
            {
              bubbles: true,
              composed: true,
              detail: { payload },
            },
          ),
        );

        return payload;
      }
```

- [ ] **Step 3: Delete the `#tokenizeSezzle` method**

Delete the entire method (lines 522–575):
```typescript
  async #tokenizeSezzle(option: PaymentMethodSelectorOption): Promise<{
    orderUuid: string;
  }> {
    const sezzleOption = option.sezzle!;

    if (!sezzleOption.checkoutUrl) {
      throw new Error(
        "Sezzle checkout URL is missing. The backend must create a checkout session first.",
      );
    }

    type SezzleSdkInstance = {
      init(options: {
        onComplete?: (event: { data?: Record<string, unknown>; [key: string]: unknown }) => void;
        onCancel?: () => void;
        onFailure?: () => void;
      }): void;
      openModal(): void;
      startCheckout(options: { checkout_url: string }): void;
    };

    const sezzle = this.#checkoutClient.sezzle as unknown as SezzleSdkInstance | null | undefined;

    if (!sezzle) {
      throw new Error(
        "Unable to load Sezzle. Choose a different payment method or try again.",
      );
    }

    // init() stores callbacks; openModal() opens the popup window (must be called while
    // user-activation is still live — Chrome preserves it through microtask awaits);
    // startCheckout() then navigates the already-open popup to the checkout URL.
    return new Promise<{ orderUuid: string }>((resolve, reject) => {
      sezzle.init({
        onComplete: (event) => {
          const orderUuid = event?.data?.order_uuid;
          if (typeof orderUuid !== "string" || !orderUuid) {
            reject(new Error("Sezzle checkout response is missing an order UUID."));
            return;
          }
          resolve({ orderUuid });
        },
        onCancel: () => {
          reject(new Error("Sezzle checkout was cancelled."));
        },
        onFailure: () => {
          reject(new Error("Sezzle checkout failed. Review your details and try again."));
        },
      });

      sezzle.openModal();
      sezzle.startCheckout({ checkout_url: sezzleOption.checkoutUrl! });
    });
```
(Delete to and including the closing `}`)

- [ ] **Step 4: Update `#createTokenizePayload` — remove sezzle orderUuid extraction**

In `#createTokenizePayload`, remove the sezzle block (lines 1178–1188):
```typescript
    if (selectedOption.sezzle) {
      const orderUuid = this.#requirePayloadString(
        payload,
        "orderUuid",
        "Sezzle checkout response is missing an order UUID.",
      );
      return {
        sezzle: {
          orderUuid,
        },
      };
    }
```

- [ ] **Step 5: Add `"sezzle"` to the `requestId` branch in `#createTokenizePayload`**

The current condition (line 1342):
```typescript
    if (selectedOption.type === "mollie" || selectedOption.type === "generic") {
      return { requestId: crypto.randomUUID() };
    }
```
Becomes:
```typescript
    if (selectedOption.type === "mollie" || selectedOption.type === "sezzle" || selectedOption.type === "generic") {
      return { requestId: crypto.randomUUID() };
    }
```

- [ ] **Step 6: Simplify the sezzle case in `#buildOptionsForGateway`**

The `#buildOptionsForGateway` case (lines 1941–1950):
```typescript
    if (gateway === "sezzle") {
      return [
        {
          type: "sezzle",
          public_key: this.#toOptionalText(config.public_key),
          checkout_url: this.#toOptionalText(config.checkout_url),
          auth_only: typeof config.auth_only === "boolean" ? config.auth_only : undefined,
        },
      ];
    }
```
Becomes (identical to the mollie_omnipay pattern on lines 1952–1954):
```typescript
    if (gateway === "sezzle") {
      return [{ type: "sezzle", gateway }];
    }
```

- [ ] **Step 7: Simplify the sezzle case in `#createNormalizedOption`**

The `#createNormalizedOption` case (lines 2617–2638):
```typescript
    if (type === "sezzle") {
      const publicKey = this.#toOptionalText(option.public_key);
      if (!publicKey) {
        return [];
      }

      const checkoutUrl = this.#toOptionalText(option.checkout_url);
      const authOnly = typeof option.auth_only === "boolean" ? option.auth_only : undefined;

      return [
        {
          id: optionId,
          type: "sezzle",
          label: "",
          disabled,
          sezzle: {
            publicKey,
            ...(checkoutUrl !== undefined ? { checkoutUrl } : {}),
            ...(authOnly !== undefined ? { authOnly } : {}),
          },
        },
      ];
    }
```
Becomes (identical to the mollie pattern on lines 2605–2614):
```typescript
    if (type === "sezzle") {
      return [
        {
          id: optionId,
          type: "sezzle",
          label: "",
          gateway: gateway || undefined,
          disabled,
        },
      ];
    }
```

- [ ] **Step 8: Verify TypeScript compiles cleanly**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements && npx tsc --noEmit
```

Expected: Zero errors.

- [ ] **Step 9: Commit**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements && git add src/elements/foxy-payment-method-selector/element.tsx && git commit -m "feat: refactor Sezzle to redirect gateway in payment method selector"
```

---

## Task 6: foxy-elements — Update tests, remove scripts and examples

**Files:**
- Modify: `src/elements/foxy-payment-method-selector/element.test.ts`
- Modify: `package.json`
- Delete: `scripts/init-sezzle-session.js`
- Delete: `examples/default/sezzle.html`
- Delete: `examples/custom/sezzle.html`

- [ ] **Step 1: Update `createSezzleApiState()` in `element.test.ts`**

The current fixture (lines 357–366) uses `public_key`. After the refactor, the API sends `{ type: "sezzle" }` (no config fields). Replace:
```typescript
function createSezzleApiState() {
  return {
    payment_gateways: [
      {
        type: "sezzle",
        public_key: "sezzle-public-key",
      },
    ],
  };
}
```
With:
```typescript
function createSezzleApiState() {
  return {
    payment_gateways: [
      {
        type: "sezzle",
      },
    ],
  };
}
```

- [ ] **Step 2: Update the Sezzle tokenize test (line 711)**

The test "renders Sezzle as a first-class option and returns Sezzle metadata from tokenize()" currently expects the old SDK payload `{ sezzle: { publicKey } }`. Replace only the tokenize assertion:
```typescript
      await expect(element.tokenize()).resolves.toEqual({
        sezzle: {
          publicKey: "sezzle-public-key",
        },
      });
```
With (matching the redirect pattern, same as Mollie at line 789):
```typescript
      await expect(element.tokenize()).resolves.toEqual({
        requestId: expect.any(String),
      });
```

- [ ] **Step 3: Update the multi-option test (line 1510)**

The test "does not use the leading-icon layout when multiple payment options are present" uses inline `{ type: "sezzle", public_key: "sezzle-public-key" }`. Replace:
```typescript
        {
          type: "sezzle",
          public_key: "sezzle-public-key",
        },
```
With:
```typescript
        {
          type: "sezzle",
        },
```

- [ ] **Step 4: Delete scripts and examples**

```bash
rm /Users/pheekus/FoxyCommerce/foxy-elements/scripts/init-sezzle-session.js
rm /Users/pheekus/FoxyCommerce/foxy-elements/examples/default/sezzle.html
rm /Users/pheekus/FoxyCommerce/foxy-elements/examples/custom/sezzle.html
```

- [ ] **Step 5: Remove `init:sezzle` from `package.json`**

In `package.json` scripts, remove:
```json
    "init:sezzle": "node ./scripts/init-sezzle-session.js",
```

- [ ] **Step 6: Run foxy-elements tests**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements && npx vitest run --project unit
```

Expected: All tests pass. Sezzle renders a branded button and `tokenize()` returns `{ requestId: <uuid> }`.

- [ ] **Step 7: Commit**

```bash
cd /Users/pheekus/FoxyCommerce/foxy-elements && git add src/elements/foxy-payment-method-selector/element.test.ts package.json && git rm scripts/init-sezzle-session.js examples/default/sezzle.html examples/custom/sezzle.html && git commit -m "test: update Sezzle tests for redirect gateway; remove Sezzle setup script and examples"
```
