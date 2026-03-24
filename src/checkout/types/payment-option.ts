/** Names of the individual ACH hosted field iframes. */
export type AchHostedFieldName =
  | "routingNumber"
  | "accountNumber"
  | "accountType"
  | "accountHolderName";

/** Allowed values for the ACH account type select field. */
export type AchAccountTypeValue = "checking" | "savings";

/** Supported secure card embed modes. */
export type CardEmbedMode = "full" | "csc-only";

/** Supported Stripe v2 option modes. */
export type StripeV2Mode = "full" | "saved";

/** Configuration for secure card capture. */
export type CardPaymentOption = {
  type: "card";
  /** The secure card capture mode to render. */
  mode?: CardEmbedMode;
  /** Stored payment token used for CSC-only flows when available. */
  token?: string;
};

/**
 * Option-level Stripe configuration used to initialize Stripe Card Element.
 * Values are passed directly from API JSON and interpreted by the UI renderer.
 */
export type StripeV2Config = {
  /** Stripe publishable key used with loadStripe. */
  publishable_key: string;
  /** Optional locale forwarded to Stripe Elements. */
  locale?: string;
  /** Optional appearance object forwarded to Stripe Elements. */
  appearance?: Record<string, unknown>;
  /** Optional Card Element options object forwarded to elements.create("card", ...). */
  card_element_options?: Record<string, unknown>;
};

/**
 * Configuration for the Stripe v2 payment option.
 *
 * - `mode: "full"` renders Stripe Card Element for new card capture.
 * - `mode: "saved"` renders a saved Stripe card option with no CSC prompt.
 */
export type StripeV2PaymentOption = {
  type: "stripe_v2";
  mode?: StripeV2Mode;
  /** Saved Stripe payment method identifier for mode="saved" when available. */
  payment_method_id?: string;
  /** Optional option-specific display label override. */
  label?: string;
  /** Optional saved-card display metadata for mode="saved". */
  card_brand?: string;
  last4?: string;
  expiration_month?: number;
  expiration_year?: number;
  /** Option-level Stripe Card Element configuration. */
  stripe?: StripeV2Config;
};

/**
 * Configuration for the ACH (bank transfer) payment option.
 *
 * - `fields` – ordered list of ACH field iframes to render. Omit to render all four fields.
 * - `account_type_values` – account type options to present in the select field. Omit to show
 *   both "checking" and "savings".
 */
export type AchPaymentOption = {
  type: "ach";
  /** Subset (and order) of ACH fields to render. Defaults to all four fields. */
  fields?: AchHostedFieldName[];
  /** Account type values to present to the customer. Defaults to both checking and savings. */
  account_type_values?: AchAccountTypeValue[];
};

/** Union of all supported payment option configuration types. */
export type PaymentOption = AchPaymentOption | CardPaymentOption | StripeV2PaymentOption;
