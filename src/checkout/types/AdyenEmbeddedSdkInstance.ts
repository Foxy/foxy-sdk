/** Supported Adyen Web environments for Advanced Flow. */
export type AdyenEmbeddedEnvironment =
  | "test"
  | "live"
  | "live-us"
  | "live-au"
  | "live-apse"
  | "live-in"
  | "live-nea";

/** Monetary amount accepted by Adyen Checkout. */
export type AdyenEmbeddedAmount = {
  /** Amount in minor units (for example cents). */
  value: number;
  /** ISO 4217 currency code. */
  currency: string;
};

/** Raw payment method entry returned by Adyen. */
export type AdyenEmbeddedPaymentMethod = {
  /** Adyen payment method identifier, for example "scheme" or "ideal". */
  type: string;
  /** Buyer-facing payment method name when Adyen provides one. */
  name?: string;
  /** Optional list of supported brands for card-like methods. */
  brands?: string[];
  /** Additional provider-specific properties exposed by Adyen. */
  [key: string]: unknown;
};

/** Payment methods payload returned by Adyen's /paymentMethods endpoint. */
export type AdyenEmbeddedPaymentMethodsResponse = {
  /** Regular payment methods available for this merchant/country/currency. */
  paymentMethods?: AdyenEmbeddedPaymentMethod[];
  /** Stored shopper payment methods, when present. */
  storedPaymentMethods?: AdyenEmbeddedPaymentMethod[];
  /** Additional provider-specific response properties. */
  [key: string]: unknown;
};

/** Minimal configuration used to initialise Adyen Checkout in Advanced Flow. */
export type AdyenEmbeddedCheckoutConfiguration = {
  /** Payment methods response from Adyen's /paymentMethods endpoint. */
  paymentMethodsResponse: AdyenEmbeddedPaymentMethodsResponse;
  /** Adyen environment matching the client-side asset region. */
  environment: AdyenEmbeddedEnvironment;
  /** Amount displayed by Adyen's payment components. */
  amount: AdyenEmbeddedAmount;
  /** Shopper country code used to filter payment methods. */
  countryCode: string;
  /** Client-side authentication key required by Adyen. */
  clientKey: string;
  /** Shopper locale used for UI translations. */
  locale?: string;
  /** Additional configuration properties supported by Adyen. */
  [key: string]: unknown;
};

/** Initialised Adyen Checkout instance. */
export type AdyenEmbeddedSdkInstance = {
  /** Discovered payment methods available for the current configuration. */
  paymentMethodsResponse: AdyenEmbeddedPaymentMethodsResponse;
  /** Updates the checkout instance with new global properties. */
  update(
    props?: Record<string, unknown>,
    options?: { shouldReinitializeCheckout?: boolean },
  ): Promise<AdyenEmbeddedSdkInstance>;
  /** Creates an action component from an Adyen action payload when supported. */
  createFromAction?(
    action: Record<string, unknown>,
    options?: Record<string, unknown>,
  ): unknown;
  /** Additional Adyen instance properties and methods. */
  [key: string]: unknown;
};

/** Browser namespace exposed by the Adyen Web script. */
export type AdyenEmbeddedSdkNamespace = {
  /** Async factory used to create an Adyen Checkout instance. */
  AdyenCheckout(
    configuration: AdyenEmbeddedCheckoutConfiguration,
  ): Promise<AdyenEmbeddedSdkInstance>;
};
