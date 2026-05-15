import type { SdkInstance } from "@paypal/paypal-js/sdk-v6";

type PayPalSdkComponents = readonly [
  "paypal-payments",
  "card-fields",
  "venmo-payments",
  "applepay-payments",
  "googlepay-payments",
];

type UndocumentedPayPalSessionCreators = {
  createBancontactOneTimePaymentSession?: () => unknown;
  createSepaOneTimePaymentSession?: () => unknown;
  createIdealOneTimePaymentSession?: () => unknown;
  createEpsOneTimePaymentSession?: () => unknown;
  createBlikOneTimePaymentSession?: () => unknown;
  createP24OneTimePaymentSession?: () => unknown;
};

export type PayPalSdkInstance = SdkInstance<PayPalSdkComponents> &
  UndocumentedPayPalSessionCreators;
