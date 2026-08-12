import type {
  AdyenEmbeddedEnvironment,
  AdyenEmbeddedPaymentMethodsResponse,
} from "./AdyenEmbeddedSdkInstance";

export type StandardCardGateway =
  | "authorize"
  | "authorize_cim"
  | "braintree_sdk"
  | "bluesnap"
  | "cybersource_rest"
  | "bank_of_america"
  | "eway"
  | "firstdata_e4"
  | "moneris"
  | "nmi_native"
  | "paytrace"
  | "quickbook_payments"
  | "vantiv_omnipay"
  | "sagepay";

export type StandardRedirectGateway = 'mollie_omnipay' | 'sezzle';
export type StripeConnectGateway = "stripe_connect" | "stripe_connect_charge";
export type StandardACHGateway = "authorize_ach" | "ach_com";

export type ApplePayConfig = {
  /** Apple Pay merchant identifier used for this gateway config. */
  merchant_id: string;
};

export type GooglePayConfig = {
  /** Google Pay merchant identifier used for this gateway config. */
  merchant_id: string;
  /** Custom tokenization parameters for payment gateway: https://developers.google.com/pay/api/web/reference/request-objects#gateway. */
  gateway_parameters?: Record<string, string>;
};

type StandardCardPaymentGatewayConfig = {
  /** Gateway identifier. */
  type: StandardCardGateway;
  /** Apple Pay configuration exposed by this gateway. */
  apple_pay: ApplePayConfig | null;
  /** Google Pay configuration exposed by this gateway. */
  google_pay: GooglePayConfig | null;
};

type StandardAchPaymentGatewayConfig = {
  /** Gateway identifier. */
  type: StandardACHGateway;
  /** Subset and order of ACH fields to render. */
  fields: (
    | "routing_number"
    | "account_number"
    | "account_type"
    | "account_holder_name"
  )[];
  /** Accepted account types. */
  account_types: ("checking" | "savings")[];
};

type StripeCardElementGatewayConfig = {
  /** Gateway identifier. */
  type: StripeConnectGateway;
  /** Publishable key for rendering a Stripe Card Element option. */
  publishable_key: string;
};

type StripePaymentElementGatewayConfig = {
  /** Gateway identifier. */
  type: "stripe_v2";
  /** Stripe publishable key for initializing Stripe.js. */
  publishable_key: string;
  /**
   * Client secret of an intent left needing a client-side step by the legacy
   * server-confirm path. Not part of the checkout flow: v3 raises that step as
   * a `confirm_intent` next action on the submit response instead.
   */
  next_action: string | null;
  /** Connected account ID used as stripeAccount when creating the Stripe client. */
  account_id: string;
  /**
   * Return URL registered with the gateway by the legacy (non-v3) flow.
   *
   * Not usable as a Stripe `return_url` here: it is only rewritten to the v3
   * `?action=return&ref=` landing for full-page-redirect gateways, so on this
   * path it still points at the legacy endpoint. The client sends the shopper's
   * own checkout URL instead.
   */
  return_url: string;
  /**
   * True when the gateway is configured to authorize only. Mirrors the
   * PaymentIntent's `capture_method: manual`, which the Payment Element has to
   * match to confirm a deferred intent.
   */
  auth_only: boolean;
};

type PayPalPlatformGatewayConfig = {
  /** Gateway identifier. */
  type: "paypal_platform";
  /** PayPal client ID for rendering and submission. */
  client_id: string;
  /** Short-lived SDK init client token from the platform; carries the merchant assertion required for find-eligible-methods. */
  client_token?: string;
};

type KlarnaGatewayConfig = {
  /** Gateway identifier. */
  type: "klarna";
  /** Klarna session identifier returned from payment initiation. */
  session_id: string;
  /** Klarna client token used to initialize the SDK. */
  client_token: string;
  /** Klarna payment method categories returned from payment initiation. */
  payment_method_categories: {
    /** Klarna payment method category identifier. */
    identifier: string;
    /** Klarna payment method category display name. */
    name: string;
    /** Klarna badge asset URLs. */
    asset_urls: {
      descriptive: string;
      standard: string;
    };
  }[];
};

type AdyenEmbeddedGatewayConfig = {
  /** Gateway identifier. */
  type: "adyen_embedded";
  /** Payment methods response from Adyen's /paymentMethods endpoint. */
  payment_methods_response: AdyenEmbeddedPaymentMethodsResponse;
  /** Adyen environment matching the session region. */
  environment: AdyenEmbeddedEnvironment;
  /** Adyen client-side authentication key. */
  client_key: string;
};

type RedirectGatewayConfig = {
  /** Gateway identifier. */
  type: StandardRedirectGateway;
};

type SquareUpGatewayConfig = {
  /** Gateway identifier. */
  type: "square_up";
  /** Square Application ID for client-side SDK initialization. */
  application_id: string;
  /** Square Location ID for this merchant. */
  location_id: string;
  /** Square environment matching the account configuration. */
  environment: "sandbox" | "production";
};

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
