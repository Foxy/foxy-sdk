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
import type {
  PaymentGatewayConfig,
  StandardACHGateway,
  StandardCardGateway,
  StripeConnectGateway,
} from "./types/PaymentGatewayConfig";
import type { Listener } from "./types/Listener";
import { initializeAdyenEmbeddedSdk } from "./utils/adyen";
import {
  isNonNegativeInteger,
  isPositiveInteger,
  isValidEmail,
  validateBillingAddressParams,
  validateCustomFields,
  validateShipmentParams,
} from "./v8n";
import { getApplePayAvailability, loadApplePaySdk } from "./utils/applePay";
import {
  canMakeGooglePayPayments as canMakeGooglePayPaymentsUtil,
  createGooglePaymentsClient as createGooglePaymentsClientUtil,
  loadGooglePaySdk as loadGooglePaySdkUtil,
} from "./utils/googlePay";
import { initializeKlarnaSdk } from "./utils/klarna";
import { initializeSezzleSdk } from "./utils/sezzle";
import { initializeSquareSdk } from "./utils/square";
import { cloneApiJson, toMutable } from "./utils/json";
import type { MutableAPIJson } from "./utils/json";
import { toFormData, toQueryString } from "./utils/url";
import { loadPayPalSdk } from "./utils/payPal";

export type { MutableAPIJson } from "./utils/json";
export { cloneApiJson, toMutable };
export type {
  AdyenEmbeddedSdkInstance,
  GooglePaymentsClient,
  KlarnaSdkInstance,
  PayPalSdkInstance,
  SquareSdkInstance,
} from "./types";

type EventName = keyof APIEventMap;
type EventWithDetailName = {
  [K in EventName]: APIEventMap[K] extends CustomEvent<unknown> ? K : never;
}[EventName];

type EventWithoutDetailName = Exclude<EventName, EventWithDetailName>;

type EventDetail<K extends EventName> =
  APIEventMap[K] extends CustomEvent<infer D> ? D : never;

type ResolvedIncomingApiState = {
  json: MutableAPIJson;
  adyenEmbedded: AdyenEmbeddedSdkInstance | null;
  paypal: PayPalSdkInstance | null;
  klarna: KlarnaSdkInstance | null;
  sezzle: SezzleSdkInstance | null;
  square: SquareSdkInstance | null;
};

type ResolveIncomingApiStateOptions = {
  onPayPalResolved?: (state: ResolvedIncomingApiState) => void;
};

function resolveBaseUrlFromStoreDomain(storeDomain: string): string {
  const normalizedStoreDomain = storeDomain
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");

  if (!normalizedStoreDomain) {
    throw new Error("storeDomain is required.");
  }

  if (normalizedStoreDomain.includes(".")) {
    return `https://${normalizedStoreDomain}/`;
  }

  const foxycartDomain = import.meta.env.VITE_FOXYCART_DOMAIN;

  if (!foxycartDomain) {
    throw new Error(
      "VITE_FOXYCART_DOMAIN is required when using a Foxy subdomain storeDomain.",
    );
  }

  return `https://${normalizedStoreDomain}.${foxycartDomain}/`;
}

function getPayPalEligibilityAmount(json: APIJson): string | undefined {
  const currentTotal = json.totals[0]?.total_order;

  if (typeof currentTotal !== "number" || !Number.isFinite(currentTotal)) {
    return undefined;
  }

  const maximumFractionDigits = Math.max(
    0,
    Math.min(20, json.format.maximum_fraction_digits ?? 2),
  );

  return currentTotal.toFixed(maximumFractionDigits);
}

function isPaymentGatewayConfigType<
  GatewayType extends PaymentGatewayConfig["type"],
>(
  config: PaymentGatewayConfig,
  type: GatewayType,
): config is Extract<PaymentGatewayConfig, { type: GatewayType }> {
  return config.type === type;
}

function getPaymentGatewayConfigs<
  GatewayType extends PaymentGatewayConfig["type"],
>(
  json: Pick<APIJson, "payment_gateways">,
  type: GatewayType,
): Extract<PaymentGatewayConfig, { type: GatewayType }>[] {
  return (json.payment_gateways ?? []).filter((config) =>
    isPaymentGatewayConfigType(config, type),
  );
}

function getFirstPaymentGatewayConfig<
  GatewayType extends PaymentGatewayConfig["type"],
>(
  json: Pick<APIJson, "payment_gateways">,
  type: GatewayType,
): Extract<PaymentGatewayConfig, { type: GatewayType }> | undefined {
  return getPaymentGatewayConfigs(json, type)[0];
}

function getAdyenCheckoutAmount(
  json: APIJson,
): AdyenEmbeddedAmount | undefined {
  const currentTotal = json.totals[0]?.total_order;
  const rawCurrencyCode = json.format.currency_code;

  if (typeof currentTotal !== "number" || !Number.isFinite(currentTotal)) {
    return undefined;
  }

  if (typeof rawCurrencyCode !== "string" || !rawCurrencyCode.trim()) {
    return undefined;
  }

  const maximumFractionDigits = Math.max(
    0,
    Math.min(20, json.format.maximum_fraction_digits ?? 2),
  );
  const multiplier = 10 ** maximumFractionDigits;
  const value = Math.round((currentTotal + Number.EPSILON) * multiplier);

  if (!Number.isSafeInteger(value) || value < 0) {
    return undefined;
  }

  return {
    value,
    currency: rawCurrencyCode.trim().toUpperCase(),
  };
}

async function resolveIncomingApiState(
  json: APIJson,
  options: ResolveIncomingApiStateOptions = {},
): Promise<ResolvedIncomingApiState> {
  const nextJson = cloneApiJson(json);
  let adyenEmbedded: AdyenEmbeddedSdkInstance | null = null;
  let paypal: PayPalSdkInstance | null = null;
  let klarna: KlarnaSdkInstance | null = null;
  let sezzle: SezzleSdkInstance | null = null;
  let square: SquareSdkInstance | null = null;
  const isBrowserEnvironment =
    typeof window !== "undefined" && typeof document !== "undefined";

  const payPalGatewayConfigs = getPaymentGatewayConfigs(
    nextJson,
    "paypal_platform",
  );

  if (payPalGatewayConfigs.length && isBrowserEnvironment) {
    const payPalInstances = await Promise.all(
      payPalGatewayConfigs.map(async (config) => {
        try {
          return await loadPayPalSdk({
            clientId: config.client_id,
            customConfig: nextJson.custom_config,
            amount: getPayPalEligibilityAmount(nextJson),
            currencyCode: nextJson.format.currency_code,
            locale: nextJson.format.locale_code,
            buyerCountry: nextJson.billing_address.country,
          });
        } catch {
          console.warn(
            "PayPal SDK was not initialized because the PayPal SDK could not be loaded.",
          );
          return null;
        }
      }),
    );

    paypal = payPalInstances.find((instance) => instance !== null) ?? null;
  }

  options.onPayPalResolved?.({
    json: nextJson,
    adyenEmbedded,
    paypal,
    klarna,
    sezzle,
    square,
  });

  const klarnaConfig = getFirstPaymentGatewayConfig(nextJson, "klarna");
  const thirdPartySdkTasks: Promise<void>[] = [];

  if (klarnaConfig) {
    if (!isBrowserEnvironment) {
      console.warn(
        "Klarna SDK was not initialized because checkout API JSON was processed outside a browser environment.",
      );
    } else {
      thirdPartySdkTasks.push(
        initializeKlarnaSdk(klarnaConfig.client_token)
          .then((instance) => {
            klarna = instance;
          })
          .catch(() => {
            console.warn(
              "Klarna SDK was not initialized because the Klarna SDK could not be loaded.",
            );
          }),
      );
    }
  }

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

  const adyenEmbeddedConfig = getFirstPaymentGatewayConfig(
    nextJson,
    "adyen_embedded",
  );

  if (adyenEmbeddedConfig) {
    if (!isBrowserEnvironment) {
      console.warn(
        "Adyen Embedded SDK was not initialized because checkout API JSON was processed outside a browser environment.",
      );
    } else {
      thirdPartySdkTasks.push(
        initializeAdyenEmbeddedSdk({
          paymentMethodsResponse: adyenEmbeddedConfig.payment_methods_response,
          environment: adyenEmbeddedConfig.environment,
          clientKey: adyenEmbeddedConfig.client_key,
          amount: getAdyenCheckoutAmount(nextJson),
          locale: nextJson.format.locale_code,
          countryCode: nextJson.billing_address.country,
        })
          .then((instance) => {
            adyenEmbedded = instance;
          })
          .catch(() => {
            console.warn(
              "Adyen Embedded SDK was not initialized because the Adyen SDK could not be loaded.",
            );
          }),
      );
    }
  }

  const squareUpConfig = getFirstPaymentGatewayConfig(nextJson, "square_up");

  if (squareUpConfig) {
    if (!isBrowserEnvironment) {
      console.warn(
        "Square SDK was not initialized because checkout API JSON was processed outside a browser environment.",
      );
    } else {
      thirdPartySdkTasks.push(
        initializeSquareSdk({
          applicationId: squareUpConfig.application_id,
          locationId: squareUpConfig.location_id,
          environment: squareUpConfig.environment,
        })
          .then((instance) => {
            square = instance;
          })
          .catch(() => {
            console.warn(
              "Square SDK was not initialized because the Square SDK could not be loaded.",
            );
          }),
      );
    }
  }

  await Promise.all(thirdPartySdkTasks);

  return {
    json: nextJson,
    adyenEmbedded,
    paypal,
    klarna,
    sezzle,
    square,
  };
}

type CheckOutPaymentOption =
  | { gateway: "adyen_embedded" }
  | {
      gateway: "klarna";
      authorization_token: string;
    }
  | ({ gateway: "paypal_platform" } & (
      | {
          order_id: string;
          payer_id: string;
          payment_id?: string;
          billing_token?: string;
        }
      | { card_token: string }
      | { apple_pay_token: string }
      | { google_pay_token: string }
      | { subscription_id: string; payer_id: string }
    ))
  | {
      gateway: "square_up";
      nonce: string;
    }
  | {
      gateway: "purchase_order";
      purchase_order_number: string;
    }
  | {
      gateway: "sezzle";
      order_uuid: string;
    }
  | {
      gateway: StandardACHGateway;
      ach_token: string;
    }
  | ({
      gateway: StandardCardGateway;
    } & (
      | { card_token: string }
      | { apple_pay_token: string }
      | { google_pay_token: string }
    ))
  | {
      gateway: "standard_redirect";
    }
  | {
      gateway: "stripe_connect" | "stripe_connect_charge";
      card_token_id: string;
    }
  | ({
      gateway: "stripe_v2";
    } & ({ confirmation_token_id: string } | { payment_intent_id: string }));

export type APIOptions = {
  storeDomain?: string;
  initialState?: "idle" | "busy";
  onError?: (error: Error) => void;
};

export type HydrateJsonOptions = {
  state?: "idle" | "busy";
  emitUpdate?: boolean;
};

export type APIConstructorParams = APIOptions & {
  initialJson?: APIJson;
};

/**
 * This is going to be under SDK.Checkout.API in the @foxy.io/sdk package.
 * Pages using loader.js will have an initialized instance under window.Foxy.api.
 *
 * Fires non-cancelable `update` event whenever the resolved checkout state changes.
 */
export class API extends EventTarget {
  #state: "idle" | "busy";
  #json: MutableAPIJson | null;
  #adyenEmbedded: AdyenEmbeddedSdkInstance | null;
  #klarna: KlarnaSdkInstance | null;
  #paypal: PayPalSdkInstance | null;
  #sezzle: SezzleSdkInstance | null;
  #square: SquareSdkInstance | null;
  #baseUrl: string | null;
  #jsonResolutionVersion = 0;
  readonly #onError?: (error: Error) => void;

  static canMakeApplePayPayments(): boolean {
    return getApplePayAvailability() === "available";
  }

  static async ensureApplePayScriptLoaded(): Promise<void> {
    try {
      await loadApplePaySdk();
    } catch {
      return;
    }
  }

  static async loadGooglePaySdk(): Promise<void> {
    await loadGooglePaySdkUtil();
  }

  static async ensureGooglePayScriptLoaded(): Promise<void> {
    try {
      await API.loadGooglePaySdk();
    } catch {
      return;
    }
  }

  static async createGooglePaymentsClient(
    environment: "TEST" | "PRODUCTION" = "TEST",
  ): Promise<GooglePaymentsClient> {
    return createGooglePaymentsClientUtil(environment);
  }

  static async canMakeGooglePayPayments(
    allowedPaymentMethod: Record<string, unknown>,
  ): Promise<boolean> {
    return canMakeGooglePayPaymentsUtil(allowedPaymentMethod);
  }

  constructor(params?: APIConstructorParams) {
    super();
    const { initialJson, storeDomain, initialState, onError } = params ?? {};
    this.#baseUrl = storeDomain
      ? resolveBaseUrlFromStoreDomain(storeDomain)
      : null;
    this.#onError = onError;

    if (initialJson !== undefined) {
      this.#json = cloneApiJson(initialJson);
      this.#adyenEmbedded = null;
      this.#klarna = null;
      this.#paypal = null;
      this.#sezzle = null;
      this.#square = null;
      this.#state = initialState ?? "idle";
      void this.replaceJson(initialJson);
    } else {
      this.#json = null;
      this.#adyenEmbedded = null;
      this.#klarna = null;
      this.#paypal = null;
      this.#sezzle = null;
      this.#square = null;
      this.#state = initialState ?? (this.#baseUrl ? "busy" : "idle");

      // WHY USE SETTIMEOUT:
      // An instance of this API is exposed via a loader.js script used both by us on our
      // hosted pages and by merchants on theirs. When used on merchant pages, we want this client
      // to automatically load the JSON data without any extra steps. On our hosted pages, however,
      // we have an opportunity to inline that JSON data while rendering HTML server-side. By delaying
      // the automatic JSON loading to the next tick, we give priority to any inline
      // JSON loading that may be happening in the same tick, which allows us to avoid an
      // unnecessary additional request for the JSON data on our hosted pages.
      setTimeout(() => {
        if (this.#json !== null || !this.#baseUrl) return;

        void this.runMutation(async () => {
          const nextJson = await this.getJson("/cart");
          await this.replaceJson(nextJson);
        });
      }, 0);
    }
  }

  addEventListener<K extends keyof APIEventMap>(
    type: K,
    listener: Listener<K, API>,
  ): void;

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
  ): void;

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
  ): void {
    return super.addEventListener(type, listener);
  }

  removeEventListener<K extends keyof APIEventMap>(
    type: K,
    listener: Listener<K, API>,
  ): void;

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
  ): void;

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
  ): void {
    return super.removeEventListener(type, listener);
  }

  get state(): "idle" | "busy" {
    return this.#state;
  }

  get json(): APIJson | null {
    return this.#json as APIJson | null;
  }

  get adyenEmbedded(): AdyenEmbeddedSdkInstance | null {
    return this.#adyenEmbedded;
  }

  get klarna(): KlarnaSdkInstance | null {
    return this.#klarna;
  }

  get paypal(): PayPalSdkInstance | null {
    return this.#paypal;
  }

  get sezzle(): SezzleSdkInstance | null {
    return this.#sezzle;
  }

  get square(): SquareSdkInstance | null {
    return this.#square;
  }

  async hydrateJson(
    nextJson: APIJson,
    options?: HydrateJsonOptions,
  ): Promise<void> {
    const resolutionVersion = ++this.#jsonResolutionVersion;
    const nextState = options?.state ?? "idle";
    const emitUpdate = options?.emitUpdate ?? true;

    const resolvedState = await resolveIncomingApiState(nextJson, {
      onPayPalResolved: (payPalResolvedState) => {
        if (resolutionVersion === this.#jsonResolutionVersion) {
          this.#applyResolvedState(payPalResolvedState, {
            state: nextState,
            emitUpdate,
          });
        }
      },
    });

    if (resolutionVersion === this.#jsonResolutionVersion) {
      this.#applyResolvedState(resolvedState, { emitUpdate });
    }
  }

  setStoreDomain(storeDomain: string): void {
    this.#baseUrl = resolveBaseUrlFromStoreDomain(storeDomain);

    if (this.#json !== null || this.#state === "busy") {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.getJson("/cart");
      await this.replaceJson(nextJson);
    });
  }

  protected setState(state: "idle" | "busy", emitUpdate = true): void {
    this.#state = state;

    if (emitUpdate) {
      this.dispatchEvent(new Event("update"));
    }
  }

  protected mutateJson(mutator: (json: MutableAPIJson) => void): void {
    if (!this.#json) return;
    mutator(this.#json);

    this.dispatchEvent(new Event("update"));
  }

  protected async replaceJson(nextJson: APIJson): Promise<void> {
    const resolutionVersion = ++this.#jsonResolutionVersion;

    const resolvedState = await resolveIncomingApiState(nextJson, {
      onPayPalResolved: (payPalResolvedState) => {
        if (resolutionVersion === this.#jsonResolutionVersion) {
          this.#applyResolvedState(payPalResolvedState);
        }
      },
    });

    if (resolutionVersion !== this.#jsonResolutionVersion) {
      return;
    }

    this.#applyResolvedState(resolvedState);
  }

  #applyResolvedState(
    resolvedState: ResolvedIncomingApiState,
    options: { state?: "idle" | "busy"; emitUpdate?: boolean } = {},
  ): void {
    const emitUpdate = options.emitUpdate ?? true;
    const previousJson = JSON.stringify(this.#json);
    const nextResolvedJson = JSON.stringify(resolvedState.json);
    const stateChanged =
      options.state !== undefined && this.#state !== options.state;
    const adyenEmbeddedChanged =
      this.#adyenEmbedded !== resolvedState.adyenEmbedded;
    const klarnaChanged = this.#klarna !== resolvedState.klarna;
    const paypalChanged = this.#paypal !== resolvedState.paypal;
    const sezzleChanged = this.#sezzle !== resolvedState.sezzle;
    const squareChanged = this.#square !== resolvedState.square;

    this.#json = resolvedState.json;
    this.#adyenEmbedded = resolvedState.adyenEmbedded;
    this.#klarna = resolvedState.klarna;
    this.#paypal = resolvedState.paypal;
    this.#sezzle = resolvedState.sezzle;
    this.#square = resolvedState.square;

    if (options.state !== undefined) {
      this.#state = options.state;
    }

    if (
      emitUpdate &&
      (previousJson !== nextResolvedJson ||
        stateChanged ||
        adyenEmbeddedChanged ||
        klarnaChanged ||
        paypalChanged ||
        sezzleChanged ||
        squareChanged)
    ) {
      this.dispatchEvent(new Event("update"));
    }
  }

  protected dispatchCancelable<K extends EventWithoutDetailName>(
    type: K,
  ): boolean;
  protected dispatchCancelable<K extends EventWithDetailName>(
    type: K,
    detail: EventDetail<K>,
  ): boolean;
  protected dispatchCancelable<K extends EventName>(
    type: K,
    detail?: EventDetail<K>,
  ): boolean {
    const event =
      detail === undefined
        ? new Event(type, { cancelable: true })
        : new CustomEvent(type, { cancelable: true, detail });

    return this.dispatchEvent(event);
  }

  protected addErrorMessage(message: string, context = "sdk"): void {
    if (!this.#json) return;
    this.mutateJson((json) => {
      json.messages.push({ context, message, level: "error" });
    });
  }

  updateItemQuantity = (
    ...params: { id: number; quantity: number }[]
  ): void => {
    this.assertStoreDomain();

    if (!this.json) return;
    const payload: Record<
      string,
      string | number | boolean | null | undefined
    > = {};

    for (const [index, param] of params.entries()) {
      if (
        !isPositiveInteger(param.id) ||
        !isNonNegativeInteger(param.quantity)
      ) {
        this.addErrorMessage(
          "Each item update requires a positive id and non-negative quantity.",
          "item-update",
        );
        return;
      }

      const item = this.json.items.find(
        (candidate) => candidate.id === param.id,
      );
      if (!item) {
        this.addErrorMessage(`Item ${param.id} was not found.`, "item-update");
        return;
      }

      if (
        !this.dispatchCancelable("item-update", {
          oldItem: toMutable(item),
          newItem: toMutable({ ...item, quantity: param.quantity }),
        })
      ) {
        return;
      }

      const prefix = index + 1;
      payload[`${prefix}:id`] = param.id;
      payload[`${prefix}:quantity`] = param.quantity;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson("/cart", payload);
      await this.replaceJson(nextJson);
    });
  };

  removeItem = (...params: { id: number }[]): void => {
    this.assertStoreDomain();

    if (!this.json) return;
    const payload: Record<
      string,
      string | number | boolean | null | undefined
    > = {};

    for (const [index, param] of params.entries()) {
      if (!isPositiveInteger(param.id)) {
        this.addErrorMessage(
          "Each remove call requires a positive item id.",
          "item-remove",
        );
        return;
      }

      const item = this.json.items.find(
        (candidate) => candidate.id === param.id,
      );
      if (!item) {
        this.addErrorMessage(`Item ${param.id} was not found.`, "item-remove");
        return;
      }

      if (!this.dispatchCancelable("item-remove", { item: toMutable(item) })) {
        return;
      }

      const prefix = index + 1;
      payload[`${prefix}:id`] = param.id;
      payload[`${prefix}:quantity`] = 0;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson("/cart", payload);
      await this.replaceJson(nextJson);
    });
  };

  clearCart = (reset?: boolean): void => {
    this.assertStoreDomain();

    if (!this.dispatchCancelable("cart-clear")) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson("/cart", {
        empty: reset ? "reset" : "true",
      });
      await this.replaceJson(nextJson);
    });
  };

  applyCouponOrGiftCardCode = (params: { code: string }): void => {
    this.assertStoreDomain();

    const code = params.code.trim();

    if (!code) {
      this.addErrorMessage(
        "Coupon or gift card code is required.",
        "coupon-or-gift-card-apply",
      );
      return;
    }

    if (!this.dispatchCancelable("coupon-or-gift-card-apply", { code })) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson("/cart", {
        coupon: code,
        gift_card: code,
      });
      await this.replaceJson(nextJson);
    });
  };

  removeCouponCode = (params: { couponId: number }): void => {
    this.assertStoreDomain();

    if (!this.json) return;
    if (!isPositiveInteger(params.couponId)) {
      this.addErrorMessage(
        "Coupon id must be a positive integer.",
        "coupon-remove",
      );
      return;
    }

    const coupon = this.json.totals[0]?.coupons.find(
      (candidate) => candidate.id === params.couponId,
    );
    if (!coupon) {
      this.addErrorMessage(
        `Coupon ${params.couponId} was not found.`,
        "coupon-remove",
      );
      return;
    }

    if (!this.dispatchCancelable("coupon-remove", { coupon })) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson("/cart", {
        action: "remove_coupon",
        coupon_id: params.couponId,
      });
      await this.replaceJson(nextJson);
    });
  };

  removeGiftCardCode = (params: { giftCardId: number }): void => {
    this.assertStoreDomain();

    if (!this.json) return;
    if (!isPositiveInteger(params.giftCardId)) {
      this.addErrorMessage(
        "Gift card id must be a positive integer.",
        "gift-card-remove",
      );
      return;
    }

    const giftCard = this.json.totals[0]?.gift_cards.find(
      (candidate) => candidate.id === params.giftCardId,
    );
    if (!giftCard) {
      this.addErrorMessage(
        `Gift card ${params.giftCardId} was not found.`,
        "gift-card-remove",
      );
      return;
    }

    if (!this.dispatchCancelable("gift-card-remove", { giftCard })) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson("/cart", {
        action: "remove_gift_card",
        gift_card_id: params.giftCardId,
      });
      await this.replaceJson(nextJson);
    });
  };

  addMessage(params: APIJson["messages"][number]): number {
    if (!this.json) return -1;
    if (!this.dispatchCancelable("messages-add", { message: params })) {
      return -1;
    }

    this.mutateJson((json) => {
      json.messages.push(params);
    });

    return this.json.messages.length - 1;
  }

  removeMessage(index: number): void {
    if (!this.json) return;
    if (!isNonNegativeInteger(index)) {
      this.addErrorMessage(
        "Message index must be a non-negative integer.",
        "messages-remove",
      );
      return;
    }

    const message = this.json.messages[index];
    if (!message) {
      this.addErrorMessage(
        `Message index ${index} is out of bounds.`,
        "messages-remove",
      );
      return;
    }

    if (!this.dispatchCancelable("messages-remove", { message })) {
      return;
    }

    this.mutateJson((json) => {
      json.messages.splice(index, 1);
    });
  }

  clearMessages(): void {
    if (!this.dispatchCancelable("messages-clear")) {
      return;
    }

    this.mutateJson((json) => {
      json.messages = [];
    });
  }

  setEmail(email: string, mode?: "guest" | "registered"): void {
    this.assertStoreDomain();

    const normalizedEmail = email.trim();

    if (!isValidEmail(normalizedEmail)) {
      this.addErrorMessage("A valid email is required.", "email-update");
      return;
    }

    if (!this.dispatchCancelable("email-update", { email: normalizedEmail })) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson("/checkout", {
        customer_email: normalizedEmail,
        customer_type: mode,
      });
      await this.replaceJson(nextJson);
    });
  }

  requestTemporaryPassword(email?: string): void {
    this.assertStoreDomain();

    const emailToUse = (email ?? this.json?.customer.email ?? "").trim();

    if (!isValidEmail(emailToUse)) {
      this.addErrorMessage(
        "A valid email is required for temporary password request.",
        "temporary-password-request",
      );
      return;
    }

    if (
      !this.dispatchCancelable("temporary-password-request", {
        email: emailToUse,
      })
    ) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson("/checkout", {
        action: "request_temporary_password",
        customer_email: emailToUse,
      });
      await this.replaceJson(nextJson);
    });
  }

  signIn = (params: { email: string; password: string }): void => {
    this.assertStoreDomain();

    const email = params.email.trim();
    const password = params.password;

    if (!isValidEmail(email)) {
      this.addErrorMessage("A valid sign-in email is required.", "sign-in");
      return;
    }

    if (!password.trim()) {
      this.addErrorMessage("Password is required.", "sign-in");
      return;
    }

    if (!this.dispatchCancelable("sign-in", { email, password })) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson("/checkout", {
        customer_email: email,
        customer_password: password,
      });
      await this.replaceJson(nextJson);
    });
  };

  signOut(): void {
    this.assertStoreDomain();

    if (!this.dispatchCancelable("sign-out")) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson("/checkout", {
        customer_email: "",
      });
      await this.replaceJson(nextJson);
    });
  }

  updateShipment = (
    params: Partial<{
      index: number;
      first_name: string;
      last_name: string;
      company: string;
      phone: string;
      address1: string;
      address2: string;
      city: string;
      region: string;
      postal_code: string;
      country: string;
      shipping_service_id: number | null;
    }>,
  ): void => {
    this.assertStoreDomain();

    const index = params.index ?? 0;

    if (!isNonNegativeInteger(index)) {
      this.addErrorMessage(
        "Shipment index must be a non-negative integer.",
        "shipment-update",
      );
      return;
    }

    if (!this.json) return;
    const shipment = this.json.shipments[index];
    if (!shipment) {
      this.addErrorMessage(
        `Shipment ${index} was not found.`,
        "shipment-update",
      );
      return;
    }

    const nextShipment = {
      ...toMutable(shipment),
      first_name: params.first_name ?? shipment.first_name,
      last_name: params.last_name ?? shipment.last_name,
      company: params.company ?? shipment.company,
      phone: params.phone ?? shipment.phone,
      address1: params.address1 ?? shipment.address1,
      address2: params.address2 ?? shipment.address2,
      city: params.city ?? shipment.city,
      region: params.region ?? shipment.region,
      postal_code: params.postal_code ?? shipment.postal_code,
      country: params.country ?? shipment.country,
      shipping_service_id:
        params.shipping_service_id ?? shipment.shipping_service_id,
    };

    const shipmentErrors = validateShipmentParams(
      params as Record<string, string | null | undefined>,
      this.json.display,
      {
        countryOptions: shipment.country_options,
        regionOptions: shipment.region_options,
      },
    );
    for (const err of shipmentErrors) {
      this.addErrorMessage(err.message, err.context);
    }
    if (shipmentErrors.length > 0) return;

    if (!this.dispatchCancelable("shipment-update", nextShipment)) {
      return;
    }

    const payload: Record<
      string,
      string | number | boolean | null | undefined
    > = {};

    const map: Array<[keyof typeof params, string]> = [
      ["first_name", `shipto_${index}_first_name`],
      ["last_name", `shipto_${index}_last_name`],
      ["company", `shipto_${index}_company`],
      ["phone", `shipto_${index}_phone`],
      ["address1", `shipto_${index}_address1`],
      ["address2", `shipto_${index}_address2`],
      ["city", `shipto_${index}_city`],
      ["region", `shipto_${index}_region`],
      ["postal_code", `shipto_${index}_postal_code`],
      ["country", `shipto_${index}_country`],
    ];

    for (const [source, target] of map) {
      const value = params[source];
      if (value !== undefined) {
        payload[target] = value;
      }
    }

    if (params.shipping_service_id !== undefined) {
      payload[
        index === 0 ? "shipping_service_id" : `shipto_${index}_service_id`
      ] = params.shipping_service_id;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson("/checkout", payload);
      await this.replaceJson(nextJson);
    });
  };

  updateBillingAddress = (
    params: Partial<{
      first_name: string;
      last_name: string;
      company: string;
      phone: string;
      address1: string;
      address2: string;
      city: string;
      region: string;
      postal_code: string;
      country: string;
    }>,
  ): void => {
    this.assertStoreDomain();

    if (!this.json) return;
    const nextAddress = {
      ...this.json.billing_address,
      ...params,
    };

    const billingErrors = validateBillingAddressParams(
      params as Record<string, string | null | undefined>,
      this.json.display,
      {
        countryOptions:
          this.json.billing_address.country_options ??
          this.json.shipments[0]?.country_options,
        regionOptions:
          this.json.billing_address.region_options ??
          this.json.shipments[0]?.region_options,
      },
    );
    for (const err of billingErrors) {
      this.addErrorMessage(err.message, err.context);
    }
    if (billingErrors.length > 0) return;

    if (!this.dispatchCancelable("billing-address-update", nextAddress)) {
      return;
    }

    const payload = {
      billing_first_name: params.first_name,
      billing_last_name: params.last_name,
      billing_company: params.company,
      billing_phone: params.phone,
      billing_address1: params.address1,
      billing_address2: params.address2,
      billing_city: params.city,
      billing_region: params.region,
      billing_postal_code: params.postal_code,
      billing_country: params.country,
    };

    void this.runMutation(async () => {
      const nextJson = await this.postJson("/checkout", payload);
      await this.replaceJson(nextJson);
    });
  };

  setCustomFields = (fields: CustomFields): void => {
    this.assertStoreDomain();

    const errors = validateCustomFields(fields);
    if (errors.length > 0) {
      for (const error of errors) {
        this.addErrorMessage(error, "custom-fields-update");
      }
      return;
    }

    if (!this.dispatchCancelable("custom-fields-update", fields)) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson("/checkout", fields);
      await this.replaceJson(nextJson);
    });
  };

  async submitAdyenEmbeddedPayment(
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    this.assertStoreDomain();

    const response = await fetch(
      this.resolveUrl("/helpers", {
        action: "submit_adyen_embedded_payment",
      }),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      },
    );

    if (!response.ok) {
      throw this.createRequestError(
        response.status,
        "Adyen payment submission failed.",
      );
    }

    return (await response.json()) as Record<string, unknown>;
  }

  async submitAdyenEmbeddedPaymentDetails(
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    this.assertStoreDomain();

    const response = await fetch(
      this.resolveUrl("/helpers", {
        action: "submit_adyen_embedded_payment_details",
      }),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      },
    );

    if (!response.ok) {
      throw this.createRequestError(
        response.status,
        "Adyen payment details submission failed.",
      );
    }

    return (await response.json()) as Record<string, unknown>;
  }

  async getAddressSuggestions(params: {
    postalCode: string;
    country: string;
  }): Promise<
    Array<{
      country: string;
      region: string;
      city: string;
      address1: string;
      address2: string;
      postal_code: string;
    }>
  > {
    this.assertStoreDomain();

    const postalCode = params.postalCode.trim();
    const country = params.country.trim().toUpperCase();

    if (!postalCode || !country) {
      return [];
    }

    const response = await fetch(
      this.resolveUrl("/helpers", {
        action: "get_address_suggestions",
        country,
        postal_code: postalCode,
      }),
    );

    if (!response.ok) {
      throw this.createRequestError(
        response.status,
        "Failed to load address suggestions.",
      );
    }

    const json = (await response.json()) as unknown;

    if (!Array.isArray(json)) {
      return [];
    }

    return json as Array<{
      country: string;
      region: string;
      city: string;
      address1: string;
      address2: string;
      postal_code: string;
    }>;
  }

  logError(error: Error): void {
    this.assertStoreDomain();

    if (this.json?.debug) {
      console.error(error);
    }

    void fetch(this.resolveUrl("/helpers", { action: "log_error" }), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: toFormData({ error: error.message }),
    }).catch(() => {
      this.#onError?.(error);
    });
  }

  async validateApplePayMerchant(params: {
    validationURL: string;
  }): Promise<unknown> {
    this.assertStoreDomain();

    const validationURL = params.validationURL.trim();

    if (!validationURL) {
      throw new Error("Apple Pay validation URL is required.");
    }

    const response = await fetch(
      this.resolveUrl("/checkout", { action: "validate_merchant" }),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: toFormData({ validationURL }),
      },
    );

    if (!response.ok) {
      throw this.createRequestError(
        response.status,
        "Failed to validate Apple Pay merchant.",
      );
    }

    return (await response.json()) as unknown;
  }

  checkOut = (paymentMethod: CheckOutPaymentOption): void => {
    this.assertStoreDomain();

    if (!this.dispatchCancelable("checkout")) {
      return;
    }

    const payload =
      paymentMethod && typeof paymentMethod === "object"
        ? ({ ...paymentMethod, action: "submit" } as Record<string, unknown>)
        : { action: "submit", payment_method: paymentMethod };

    void this.runMutation(async () => {
      const nextJson = await this.postJson("/checkout", payload);
      await this.replaceJson(nextJson);
    });
  };

  private async runMutation(action: () => Promise<void>): Promise<void> {
    this.setState("busy");

    try {
      await action();
    } catch (error) {
      const normalized =
        error instanceof Error ? error : new Error(String(error));
      this.addErrorMessage(normalized.message, "network");
      this.#onError?.(normalized);
    } finally {
      this.setState("idle");
    }
  }

  private resolveUrl(
    path: string,
    query?: Record<string, string | number | boolean | null | undefined>,
  ): string {
    const base = this.assertStoreDomain().replace(/\/$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const suffix = query ? `?${toQueryString(query)}` : "";

    return `${base}${normalizedPath}${suffix}`;
  }

  private assertStoreDomain(): string {
    if (!this.#baseUrl) {
      throw new Error(
        "This API instance is inactive until storeDomain is set.",
      );
    }

    return this.#baseUrl;
  }

  private async postJson(
    path: string,
    body: Record<string, unknown>,
  ): Promise<APIJson> {
    const response = await fetch(this.resolveUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: toFormData({ ...body, output: "json" }),
    });

    if (!response.ok) {
      throw this.createRequestError(
        response.status,
        `Request failed for ${path}.`,
      );
    }

    return (await response.json()) as APIJson;
  }

  private async getJson(path: string): Promise<APIJson> {
    const response = await fetch(this.resolveUrl(path, { output: "json" }));

    if (!response.ok) {
      throw this.createRequestError(
        response.status,
        `Request failed for ${path}.`,
      );
    }

    return (await response.json()) as APIJson;
  }

  private createRequestError(status: number, message: string): Error {
    return new Error(`${message} HTTP status ${status}.`);
  }
}
