import type {
  AdyenEmbeddedEnvironment,
  AdyenEmbeddedPaymentMethodsResponse,
} from "./AdyenEmbeddedSdkInstance";
import type { PaymentIntent } from "@stripe/stripe-js";

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
  /** If present, indicates a pending next_action flow that should be handled via stripe.handleNextAction(). */
  next_action: PaymentIntent.NextAction | null;
  /** Connected account ID used as stripeAccount when creating the Stripe client. */
  account_id: string;
  /** Return URL used by Stripe confirmation flows (setup/payment redirects). */
  return_url: string;
  /** Capture mode flag from backend. 1 means manual capture, otherwise automatic capture. */
  auth_only: boolean;
  /** If present, the backend has pre-created a PaymentIntent; confirmation should use confirmPayment() instead of createConfirmationToken(). */
  client_secret?: string;
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
