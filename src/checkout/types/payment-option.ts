export type StandardCardGateway =
  | 'accept_blue'
  | 'authorize'
  | 'authorize_cim'
  | 'bambora'
  | 'barclaycard'
  | 'beanstream'
  | 'bluefin'
  | 'bluepay'
  | 'braintree'
  | 'cardpointe'
  | 'datacash'
  | 'digitalriver'
  | 'durango'
  | 'ems_pay'
  | 'epicor_esdm_token'
  | 'eprocessingnetwork'
  | 'eway'
  | 'fatzebra'
  | 'firstdata'
  | 'firstdata_e4'
  | 'fosdick'
  | 'goemerchant'
  | 'handepay'
  | 'helcim'
  | 'helcim_commerce'
  | 'inspire'
  | 'litle'
  | 'lucy'
  | 'merchantesolutions'
  | 'migs_anz_egate'
  | 'migs_commweb'
  | 'moneris'
  | 'netbilling'
  | 'nmi'
  | 'nmi_native'
  | 'orbital_salem'
  | 'orbital_tampa'
  | 'paperless'
  | 'pawapay'
  | 'payconex'
  | 'payflowpro'
  | 'paygate'
  | 'payjunction'
  | 'payleap'
  | 'payline'
  | 'paylinedata'
  | 'paymentexpress'
  | 'paymentsense'
  | 'paypoint_enterprise'
  | 'paypoint_gateway'
  | 'paypoint_metacharge'
  | 'paytrace'
  | 'payvector'
  | 'plugnpay'
  | 'plugnpay_authnet'
  | 'propay'
  | 'quantumgateway'
  | 'quickbook_payments'
  | 'quickbooks'
  | 'realex'
  | 'sagepayments'
  | 'securenet'
  | 'stripe'
  | 'stripe_omnipay'
  | 'totalapps'
  | 'transaction_express'
  | 'transfirst'
  | 'usaepay'
  | 'vanco'
  | 'vantiv_omnipay'
  | 'virtualmerchant'
  | 'wallee'
  | 'wepay'
  | 'westpac'
  | 'xendit';

export type StandardACHGateway =
  | 'accept_blue_ach'
  | 'authorize_ach'
  | 'paperless_ach'
  | 'payjunction_ach'
  | 'vantiv_ach';

export type StandardRedirectGateway =
  | 'adyen'
  | 'amazon_fps'
  | 'bitpay'
  | 'cardx'
  | 'ccavenue'
  | 'coinbase'
  | 'coinbase_v2'
  | 'comgate'
  | 'curbstone'
  | 'cybersource_pos'
  | 'cybersource_sa_web'
  | 'dibs'
  | 'dwolla'
  | 'epayments'
  | 'mercadopago'
  | 'migs'
  | 'mollie_omnipay'
  | 'ogone'
  | 'paymentexpress_ws'
  | 'payu_omnipay'
  | 'pesapal'
  | 'skrill'
  | 'smartscreen'
  | 'tazapay'
  | 'trustcommerce'
  | 'twocheckout'
  | 'vivawallet_checkout'
  | 'wigwag'
  | 'worldline_hosted'
  | 'worldpay_online';

export type StripeConnectGateway = 'stripe_connect' | 'stripe_connect_charge';
export type StripeV2Gateway = 'stripe_v2';

export type PaymentOption =
  | {
      /** Gateway type. */
      gateway: StandardCardGateway;
      /** Optional Apple Pay setup for this card gateway (wallet-specific, non-derivable fields only). */
      apple_pay?: {
        /** Apple Pay merchant identifier used for this gateway option. */
        merchant_id: string;
      };
      /** Optional Google Pay setup for this card gateway (wallet-specific, non-derivable fields only). */
      google_pay?: {
        /** Google Pay merchant identifier. */
        merchant_id: string;
        /** Custom tokenization parameters for payment gateway: https://developers.google.com/pay/api/web/reference/request-objects#gateway. */
        gateway_parameters?: Record<string, string>;
      };
      /** If present, customer can also choose to pay with these saved payment methods. */
      saved_payment_methods?: {
        /** Payment method identifier. */
        id: string;
        /** Payment method type. Only "card" is supported at the moment. */
        type: 'card';
        /** Card brand (e.g., "visa", "mastercard"). */
        brand: string;
        /** Last 4 card digits (e.g., "1234"). */
        last_4: string;
        /** Full expiration year (e.g., 2030). */
        expiry_year: number;
        /** Expiration month from 1 to 12. */
        expiry_month: number;
      }[];
    }
  | {
      /** Gateway type. */
      gateway: StandardACHGateway;
      /** Subset and order of ACH fields to render. */
      fields: ('routing_number' | 'account_number' | 'account_type' | 'account_holder_name' | 'is_account_owner')[];
      /** Accepted account types. */
      account_types: ('checking' | 'savings')[];
    }
  | {
      /** Gateway type. */
      gateway: StandardRedirectGateway;
    }
  | {
      /** Gateway type. */
      gateway: StripeConnectGateway;
      /** Publishable key for rendering a new Stripe Card Element option. */
      publishable_key: string;
      /** If present, customer can also choose to pay with these saved payment methods. */
      saved_payment_methods?: {
        /** Stripe Payment Method identifier. */
        id: string;
        /** Stripe Payment Method type. Only "card" is supported at the moment. */
        type: 'card';
        /** Stripe Payment Method card brand. See Stripe documentation for the complete list of supported card brands. */
        brand: string;
        /** Last 4 card digits (e.g., "1234"). */
        last_4: string;
        /** Full expiration year (e.g., 2030). */
        expiry_year: number;
        /** Expiration month from 1 (January) to 12 (December). */
        expiry_month: number;
      }[];
    }
  | {
      /** Gateway type. */
      gateway: StripeV2Gateway;
      /** Enables Stripe express checkout element (Apple Pay / Google Pay / etc). */
      express_checkout: boolean;
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
      /** If present, customer can also choose to pay with these saved payment methods. */
      saved_payment_methods?: {
        /** Stripe Payment Method identifier. */
        id: string;
        /** Stripe Payment Method type. Only "card" is supported at the moment. */
        type: 'card';
        /** Stripe Payment Method card brand. See Stripe documentation for the complete list of supported card brands. */
        brand: string;
        /** Last 4 card digits (e.g., "1234"). */
        last_4: string;
        /** Full expiration year (e.g., 2030). */
        expiry_year: number;
        /** Expiration month from 1 (January) to 12 (December). */
        expiry_month: number;
      }[];
    };
