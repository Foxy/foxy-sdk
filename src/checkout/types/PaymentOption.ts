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

export type StandardACHGateway = "authorize_ach" | "ach_com";
export type StandardRedirectGateway = "mollie_omnipay";
export type PayPalPlatformGateway = "paypal_platform";
export type KlarnaGateway = "klarna";
export type StripeConnectGateway = "stripe_connect" | "stripe_connect_charge";
export type StripeV2Gateway = "stripe_v2";

export type KlarnaPaymentMethodCategory = {
  /** Klarna payment method category identifier. */
  identifier: string;
  /** Klarna payment method category display name. */
  name: string;
  /** Klarna badge asset URLs. */
  asset_urls: {
    descriptive: string;
    standard: string;
  };
};

export type SavedCardPaymentMethod = {
  /** Payment method identifier. */
  payment_method_id: string;
  /** Payment method type. Only "card" is supported at the moment. */
  payment_method_type?: "card";
  /** Card brand (e.g., "visa", "mastercard"). */
  brand: string;
  /** Last 4 card digits (e.g., "1234"). */
  last_4: string;
  /** Full expiration year (e.g., 2030). */
  expiry_year: number;
  /** Expiration month from 1 to 12. */
  expiry_month: number;
};

export type ServerSentPaymentOption =
  | {
      /** Payment option type. */
      type: "new-card";
      /** Gateway used for card tokenization submission. */
      gateway: StandardCardGateway;
    }
  | {
      /** Payment option type. */
      type: "saved-card";
      /** Gateway used for saved card submission. */
      gateway: StandardCardGateway | StripeConnectGateway | StripeV2Gateway;
      /** Saved payment method details for rendering and submission. */
      payment_method: SavedCardPaymentMethod;
    }
  | {
      /** Payment option type. */
      type: "apple-pay";
      /** Gateway used for Apple Pay token submission. */
      gateway: StandardCardGateway;
      /** Apple Pay merchant identifier used for this payment option. */
      merchant_id: string;
    }
  | {
      /** Payment option type. */
      type: "google-pay";
      /** Gateway used for Google Pay token submission. */
      gateway: StandardCardGateway;
      /** Google Pay merchant identifier. */
      merchant_id: string;
      /** Custom tokenization parameters for payment gateway: https://developers.google.com/pay/api/web/reference/request-objects#gateway. */
      gateway_parameters?: Record<string, string>;
    }
  | {
      /** Payment option type. */
      type: "ach";
      /** Gateway used for ACH token submission. */
      gateway: StandardACHGateway;
      /** Subset and order of ACH fields to render. */
      fields: (
        | "routing_number"
        | "account_number"
        | "account_type"
        | "account_holder_name"
        | "is_account_owner"
      )[];
      /** Accepted account types. */
      account_types: ("checking" | "savings")[];
    }
  | {
      /** Payment option type. */
      type: "redirect";
      /** Gateway used for redirect submission. */
      gateway: StandardRedirectGateway;
    }
  | {
      /** Payment option type. */
      type: "stripe-card-element";
      /** Gateway used for Stripe Card Element token submission. */
      gateway: StripeConnectGateway;
      /** Publishable key for rendering a new Stripe Card Element option. */
      publishable_key: string;
    }
  | {
      /** Payment option type. */
      type: "stripe-payment-element";
      /** Gateway used for Stripe Payment Element submission. */
      gateway: StripeV2Gateway;
      /** Stripe publishable key for initializing Stripe.js. */
      publishable_key: string;
      /** If present, indicates a pending next_action flow that should be handled via stripe.handleNextAction(). */
      next_action?: string;
      /** Connected account ID used as stripeAccount when creating the Stripe client. */
      account_id: string;
      /** Return URL used by Stripe confirmation flows (setup/payment redirects). */
      return_url: string;
      /** Capture mode flag from backend. 1 means manual capture, otherwise automatic capture. */
      auth_only: boolean;
    }
  | {
      /** Payment option type. */
      type: "paypal";
      /** Gateway used for PayPal submission. */
      gateway: PayPalPlatformGateway;
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "klarna";
      /** Gateway used for Klarna submission. */
      gateway: KlarnaGateway;
      /** Klarna session identifier returned from payment initiation. */
      session_id: string;
      /** Klarna client token used to initialize the SDK. */
      client_token: string;
      /** Klarna payment method categories returned from payment initiation. */
      payment_method_categories: KlarnaPaymentMethodCategory[];
    }
  | {
      /** Payment option type. */
      type: "sezzle";
      /** Used when creating a checkout or capturing payment. Find your API keys at https://dashboard.sezzle.com/merchant/settings/apikeys. */
      public_key: string;
    };

export type ClientDiscoveredPaymentOption =
  | {
      /** Payment option type. */
      type: "new-card";
      /** Gateway used for card tokenization submission. */
      gateway: PayPalPlatformGateway;
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "apple-pay";
      /** Gateway used for Apple Pay token submission. */
      gateway: PayPalPlatformGateway;
      /** PayPal client ID for rendering and submission. */
      client_id: string;
      /** Apple Pay merchant identifier used for this payment option when exposed by PayPal config. */
      merchant_id?: string;
    }
  | {
      /** Payment option type. */
      type: "google-pay";
      /** Gateway used for Google Pay token submission. */
      gateway: PayPalPlatformGateway;
      /** PayPal client ID for rendering and submission. */
      client_id: string;
      /** Google Pay merchant identifier when exposed by PayPal config. */
      merchant_id?: string;
      /** Custom tokenization parameters when exposed by PayPal config: https://developers.google.com/pay/api/web/reference/request-objects#gateway. */
      gateway_parameters?: Record<string, string>;
    }
  | {
      /** Payment option type. */
      type: "paypal-pay-later";
      /** Gateway used for PayPal submission. */
      gateway: PayPalPlatformGateway;
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "paypal-credit";
      /** Gateway used for PayPal Venmo submission. */
      gateway: PayPalPlatformGateway;
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "venmo";
      /** Gateway used for PayPal Venmo submission. */
      gateway: PayPalPlatformGateway;
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "sepa";
      /** Gateway used for SEPA token submission. */
      gateway: PayPalPlatformGateway;
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "bancontact";
      /** Gateway used for Bancontact token submission. */
      gateway: PayPalPlatformGateway;
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "eps";
      /** Gateway used for EPS token submission. */
      gateway: PayPalPlatformGateway;
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "blik";
      /** Gateway used for BLIK token submission. */
      gateway: PayPalPlatformGateway;
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "ideal";
      /** Gateway used for iDEAL token submission. */
      gateway: PayPalPlatformGateway;
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "przelewy24";
      /** Gateway used for Przelewy24 token submission. */
      gateway: PayPalPlatformGateway;
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    };

export type PaymentOption =
  | ServerSentPaymentOption
  | ClientDiscoveredPaymentOption;
