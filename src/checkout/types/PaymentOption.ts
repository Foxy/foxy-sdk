import type { AdyenEmbeddedEnvironment } from "./AdyenEmbeddedSdkInstance";

import type {
  StandardACHGateway,
  StandardCardGateway,
  StripeConnectGateway,
} from "./PaymentGatewayConfig";

export type PaymentOption =
  | {
      /** Payment option type. */
      type: "saved-card";
      /** Gateway used for saved card submission. */
      gateway:
        | StandardCardGateway
        | StripeConnectGateway
        | "stripe_v2"
        | "adyen_embedded";
      /** Payment method identifier. */
      id: string;
      /** Card brand (e.g., "visa", "mastercard"). */
      brand: string;
      /** Last 4 card digits (e.g., "1234"). */
      last_4: string;
      /** Full expiration year (e.g., 2030). */
      expiry_year: number;
      /** Expiration month from 1 to 12. */
      expiry_month: number;
    }
  | {
      /** Payment option type. */
      type: "new-card";
      /** Gateway used for card tokenization submission. */
      gateway: StandardCardGateway;
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
      gateway: "mollie_omnipay";
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
      gateway: "stripe_v2";
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
      gateway: "paypal_platform";
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "klarna";
      /** Gateway used for Klarna submission. */
      gateway: "klarna";
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
    }
  | {
      /** Payment option type. */
      type: "sezzle";
      /** Used when creating a checkout or capturing payment. Find your API keys at https://dashboard.sezzle.com/merchant/settings/apikeys. */
      public_key: string;
    }
  | {
      /** Payment option type. */
      type: "adyen_embedded";
      /** Gateway used for Adyen Components initialization and submission. */
      gateway: "adyen_embedded";
      /** Adyen session identifier returned from payment initiation. */
      session_id: string;
      /** Adyen session data blob returned from payment initiation. */
      session_data: string;
      /** Adyen environment matching the session region. */
      environment: AdyenEmbeddedEnvironment;
      /** Adyen client-side authentication key. */
      client_key: string;
    }
  | {
      /** Payment option type. */
      type: "new-card";
      /** Gateway used for Adyen card component submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen payment method identifier exposed for component instantiation. */
      adyen_payment_method_type: "card" | "scheme";
    }
  | {
      /** Payment option type. */
      type: "bancontact";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen payment method identifier exposed for component instantiation. */
      adyen_payment_method_type: "bcmc";
    }
  | {
      /** Payment option type. */
      type: "sepa";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen payment method identifier exposed for component instantiation. */
      adyen_payment_method_type: "sepadirectdebit";
    }
  | {
      /** Payment option type. */
      type: "apple-pay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen payment method identifier exposed for component instantiation. */
      adyen_payment_method_type: "applepay";
    }
  | {
      /** Payment option type. */
      type: "google-pay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen payment method identifier exposed for component instantiation. */
      adyen_payment_method_type: "googlepay" | "paywithgoogle";
    }
  | {
      /** Payment option type. */
      type: "eps";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen payment method identifier exposed for component instantiation. */
      adyen_payment_method_type: "eps";
    }
  | {
      /** Payment option type. */
      type: "blik";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen payment method identifier exposed for component instantiation. */
      adyen_payment_method_type: "blik";
    }
  | {
      /** Payment option type. */
      type: "bank-transfer";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type:
        | "bankTransfer_IBAN"
        | "bankTransfer_BE"
        | "bankTransfer_NL"
        | "bankTransfer_PL"
        | "bankTransfer_FR"
        | "bankTransfer_CH"
        | "bankTransfer_IE"
        | "bankTransfer_GB"
        | "bankTransfer_DE";
    }
  | {
      /** Payment option type. */
      type: "ach";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "ach";
    }
  | {
      /** Payment option type. */
      type: "bacs-direct-debit";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "directdebit_GB";
    }
  | {
      /** Payment option type. */
      type: "eft";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "eft_directdebit_CA";
    }
  | {
      /** Payment option type. */
      type: "affirm";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "affirm";
    }
  | {
      /** Payment option type. */
      type: "afterpay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type:
        | "afterpay"
        | "afterpay_default"
        | "afterpay_b2b";
    }
  | {
      /** Payment option type. */
      type: "atome";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "atome";
    }
  | {
      /** Payment option type. */
      type: "facilypay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type:
        | "facilypay_3x"
        | "facilypay_4x"
        | "facilypay_6x"
        | "facilypay_10x"
        | "facilypay_12x";
    }
  | {
      /** Payment option type. */
      type: "amazon-pay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "amazonpay";
    }
  | {
      /** Payment option type. */
      type: "cash-app";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "cashapp";
    }
  | {
      /** Payment option type. */
      type: "click-to-pay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "clicktopay";
    }
  | {
      /** Payment option type. */
      type: "boleto-bancario";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type:
        | "boletobancario"
        | "boletobancario_itau"
        | "boletobancario_santander"
        | "primeiropay_boleto";
    }
  | {
      /** Payment option type. */
      type: "doku";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type:
        | "doku"
        | "doku_alfamart"
        | "doku_permata_lite_atm"
        | "doku_indomaret"
        | "doku_atm_mandiri_va"
        | "doku_sinarmas_va"
        | "doku_mandiri_va"
        | "doku_cimb_va"
        | "doku_danamon_va"
        | "doku_bri_va"
        | "doku_bni_va"
        | "doku_bca_va"
        | "doku_wallet";
    }
  | {
      /** Payment option type. */
      type: "oxxo";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "oxxo";
    }
  | {
      /** Payment option type. */
      type: "billdesk";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "billdesk_online" | "billdesk_wallet";
    }
  | {
      /** Payment option type. */
      type: "dotpay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "dotpay";
    }
  | {
      /** Payment option type. */
      type: "iris";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "iris";
    }
  | {
      /** Payment option type. */
      type: "molpay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type:
        | "molpay_ebanking_fpx_MY"
        | "molpay_ebanking_TH"
        | "molpay_ebanking_VN";
    }
  | {
      /** Payment option type. */
      type: "online-banking";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type:
        | "onlineBanking_CZ"
        | "ebanking_FI"
        | "onlinebanking_IN"
        | "onlineBanking_PL"
        | "onlineBanking_SK";
    }
  | {
      /** Payment option type. */
      type: "pay-by-bank";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type:
        | "paybybank"
        | "paybybank_AIS_DD"
        | "paybybank_pix";
    }
  | {
      /** Payment option type. */
      type: "payu";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "payu_IN_cashcard" | "payu_IN_nb";
    }
  | {
      /** Payment option type. */
      type: "wallet";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "wallet_IN";
    }
  | {
      /** Payment option type. */
      type: "dragonpay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type:
        | "dragonpay_ebanking"
        | "dragonpay_otc_banking"
        | "dragonpay_otc_non_banking"
        | "dragonpay_otc_philippines";
    }
  | {
      /** Payment option type. */
      type: "econtext";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type:
        | "econtext_atm"
        | "econtext_online"
        | "econtext_seven_eleven"
        | "econtext_stores";
    }
  | {
      /** Payment option type. */
      type: "giropay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "giropay";
    }
  | {
      /** Payment option type. */
      type: "multibanco";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "multibanco";
    }
  | {
      /** Payment option type. */
      type: "redirect";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "redirect";
    }
  | {
      /** Payment option type. */
      type: "twint";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "twint";
    }
  | {
      /** Payment option type. */
      type: "vipps";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "vipps";
    }
  | {
      /** Payment option type. */
      type: "trustly";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "trustly";
    }
  | {
      /** Payment option type. */
      type: "riverty";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "riverty";
    }
  | {
      /** Payment option type. */
      type: "bancontact";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "bcmc_mobile" | "bcmc_mobile_QR";
    }
  | {
      /** Payment option type. */
      type: "pix";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "pix";
    }
  | {
      /** Payment option type. */
      type: "swish";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "swish";
    }
  | {
      /** Payment option type. */
      type: "we-chat";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "wechatpay" | "wechatpayQR";
    }
  | {
      /** Payment option type. */
      type: "prompt-pay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "promptpay";
    }
  | {
      /** Payment option type. */
      type: "pay-now";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "paynow";
    }
  | {
      /** Payment option type. */
      type: "duit-now";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "duitnow";
    }
  | {
      /** Payment option type. */
      type: "mbway";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "mbway";
    }
  | {
      /** Payment option type. */
      type: "ancv";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "ancv";
    }
  | {
      /** Payment option type. */
      type: "pay-to";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "payto";
    }
  | {
      /** Payment option type. */
      type: "upi";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "upi" | "upi_qr" | "upi_intent";
    }
  | {
      /** Payment option type. */
      type: "adyen-giftcard";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "giftcard";
    }
  | {
      /** Payment option type. */
      type: "titres-restaurant";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type:
        | "mealVoucher_FR_natixis"
        | "mealVoucher_FR_sodexo"
        | "mealVoucher_FR_groupeup";
    }
  | {
      /** Payment option type. */
      type: "alipay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "alipay";
    }
  | {
      /** Payment option type. */
      type: "alipay-plus";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "alipay_plus";
    }
  | {
      /** Payment option type. */
      type: "alipay-hk";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "alipay_hk";
    }
  | {
      /** Payment option type. */
      type: "alma";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "alma";
    }
  | {
      /** Payment option type. */
      type: "bizum";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "bizum";
    }
  | {
      /** Payment option type. */
      type: "boost";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "molpay_boost";
    }
  | {
      /** Payment option type. */
      type: "dana";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "dana";
    }
  | {
      /** Payment option type. */
      type: "gcash";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "gcash";
    }
  | {
      /** Payment option type. */
      type: "gopay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "gopay_wallet";
    }
  | {
      /** Payment option type. */
      type: "grabpay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "grabpay_SG" | "grabpay_MY" | "grabpay_PH";
    }
  | {
      /** Payment option type. */
      type: "kakaopay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "kakaopay";
    }
  | {
      /** Payment option type. */
      type: "mobilepay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "mobilepay";
    }
  | {
      /** Payment option type. */
      type: "momo-wallet";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "momo_wallet";
    }
  | {
      /** Payment option type. */
      type: "naverpay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "kcp_naverpay";
    }
  | {
      /** Payment option type. */
      type: "paybright";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "paybright";
    }
  | {
      /** Payment option type. */
      type: "payco";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "kcp_payco";
    }
  | {
      /** Payment option type. */
      type: "payme";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "payme";
    }
  | {
      /** Payment option type. */
      type: "paypo";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "paypo";
    }
  | {
      /** Payment option type. */
      type: "paysafecard";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "paysafecard";
    }
  | {
      /** Payment option type. */
      type: "paypay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "paypay";
    }
  | {
      /** Payment option type. */
      type: "rakutenpay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "rakutenpay";
    }
  | {
      /** Payment option type. */
      type: "scalapay";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "scalapay_3x";
    }
  | {
      /** Payment option type. */
      type: "touchngo";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "touchngo";
    }
  | {
      /** Payment option type. */
      type: "walley";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "walley";
    }
  | {
      /** Payment option type. */
      type: "zip";
      /** Gateway used for Adyen alternative payment method submission. */
      gateway: "adyen_embedded";
      /** Raw Adyen gateway-specific payment method identifier. */
      adyen_payment_method_type: "zip";
    }
  | {
      /** Payment option type. */
      type: "new-card";
      /** Gateway used for card tokenization submission. */
      gateway: "paypal_platform";
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "apple-pay";
      /** Gateway used for Apple Pay token submission. */
      gateway: "paypal_platform";
      /** PayPal client ID for rendering and submission. */
      client_id: string;
      /** Apple Pay merchant identifier used for this payment option when exposed by PayPal config. */
      merchant_id?: string;
    }
  | {
      /** Payment option type. */
      type: "google-pay";
      /** Gateway used for Google Pay token submission. */
      gateway: "paypal_platform";
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
      gateway: "paypal_platform";
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "paypal-credit";
      /** Gateway used for PayPal Venmo submission. */
      gateway: "paypal_platform";
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "venmo";
      /** Gateway used for PayPal Venmo submission. */
      gateway: "paypal_platform";
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "sepa";
      /** Gateway used for SEPA token submission. */
      gateway: "paypal_platform";
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "bancontact";
      /** Gateway used for Bancontact token submission. */
      gateway: "paypal_platform";
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "eps";
      /** Gateway used for EPS token submission. */
      gateway: "paypal_platform";
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "blik";
      /** Gateway used for BLIK token submission. */
      gateway: "paypal_platform";
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "ideal";
      /** Gateway used for iDEAL token submission. */
      gateway: "paypal_platform";
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    }
  | {
      /** Payment option type. */
      type: "przelewy24";
      /** Gateway used for Przelewy24 token submission. */
      gateway: "paypal_platform";
      /** PayPal client ID for rendering and submission. */
      client_id: string;
    };
