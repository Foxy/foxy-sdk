export type StandardCardGateway =
  | "accept_blue"
  | "authorize"
  | "authorize_cim"
  | "bambora"
  | "barclaycard"
  | "beanstream"
  | "bluefin"
  | "bluepay"
  | "braintree"
  | "cardpointe"
  | "datacash"
  | "digitalriver"
  | "durango"
  | "ems_pay"
  | "epicor_esdm_token"
  | "eprocessingnetwork"
  | "eway"
  | "fatzebra"
  | "firstdata"
  | "firstdata_e4"
  | "fosdick"
  | "goemerchant"
  | "handepay"
  | "helcim"
  | "helcim_commerce"
  | "inspire"
  | "litle"
  | "lucy"
  | "merchantesolutions"
  | "migs_anz_egate"
  | "migs_commweb"
  | "moneris"
  | "netbilling"
  | "nmi"
  | "nmi_native"
  | "orbital_salem"
  | "orbital_tampa"
  | "paperless"
  | "pawapay"
  | "payconex"
  | "payflowpro"
  | "paygate"
  | "payjunction"
  | "payleap"
  | "payline"
  | "paylinedata"
  | "paymentexpress"
  | "paymentsense"
  | "paypoint_enterprise"
  | "paypoint_gateway"
  | "paypoint_metacharge"
  | "paytrace"
  | "payvector"
  | "plugnpay"
  | "plugnpay_authnet"
  | "propay"
  | "quantumgateway"
  | "quickbook_payments"
  | "quickbooks"
  | "realex"
  | "sagepayments"
  | "securenet"
  | "stripe"
  | "stripe_omnipay"
  | "totalapps"
  | "transaction_express"
  | "transfirst"
  | "usaepay"
  | "vanco"
  | "vantiv_omnipay"
  | "virtualmerchant"
  | "wallee"
  | "wepay"
  | "westpac"
  | "xendit";

export type StandardACHGateway =
  | "accept_blue_ach"
  | "authorize_ach"
  | "paperless_ach"
  | "payjunction_ach"
  | "vantiv_ach";

export type StandardRedirectGateway =
  | "adyen"
  | "amazon_fps"
  | "bitpay"
  | "cardx"
  | "ccavenue"
  | "coinbase"
  | "coinbase_v2"
  | "comgate"
  | "curbstone"
  | "cybersource_pos"
  | "cybersource_sa_web"
  | "dibs"
  | "dwolla"
  | "epayments"
  | "mercadopago"
  | "migs"
  | "mollie_omnipay"
  | "ogone"
  | "paymentexpress_ws"
  | "payu_omnipay"
  | "pesapal"
  | "skrill"
  | "smartscreen"
  | "tazapay"
  | "trustcommerce"
  | "twocheckout"
  | "vivawallet_checkout"
  | "wigwag"
  | "worldline_hosted"
  | "worldpay_online";

export type PayPalPlatformGateway = "paypal_platform";
export type StripeConnectGateway = "stripe_connect" | "stripe_connect_charge";
export type StripeV2Gateway = "stripe_v2";

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
