/** Supported Adyen Web environments for Sessions flow. */
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

/** Raw payment method entry returned by Adyen Checkout. */
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

/** Payment methods payload exposed by Adyen Checkout after initialization. */
export type AdyenEmbeddedPaymentMethodsResponse = {
  /** Regular payment methods available for the current session. */
  paymentMethods?: AdyenEmbeddedPaymentMethod[];
  /** Stored shopper payment methods, when present. */
  storedPaymentMethods?: AdyenEmbeddedPaymentMethod[];
  /** Additional provider-specific response properties. */
  [key: string]: unknown;
};

/** Session object accepted by Adyen Checkout Sessions flow. */
export type AdyenEmbeddedCheckoutSession = {
  /** Unique Adyen session identifier. */
  id: string;
  /** Encoded session data blob returned by Adyen. */
  sessionData?: string;
};

/** Minimal configuration used to initialize Adyen Checkout. */
export type AdyenEmbeddedCheckoutConfiguration = {
  /** Sessions flow data returned by Adyen. */
  session: AdyenEmbeddedCheckoutSession;
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

/** Payload accepted by checkout.submitDetails() after redirects or actions. */
export type AdyenEmbeddedSubmitDetails = {
  /** Action details returned by Adyen. */
  details: Record<string, unknown>;
  /** Payment data returned by Adyen when required. */
  paymentData?: string;
  /** Updated session data returned by Adyen when required. */
  sessionData?: string;
};

/** Initialized Adyen Checkout instance used to discover and render components. */
export type AdyenEmbeddedSdkInstance = {
  /** Discovered payment methods available for the current session. */
  paymentMethodsResponse: AdyenEmbeddedPaymentMethodsResponse;
  /** Submits redirect or action details back into the Adyen session flow. */
  submitDetails(details: AdyenEmbeddedSubmitDetails): void;
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
