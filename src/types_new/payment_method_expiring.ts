import type * as FxDefaultBillingAddress from "./default_billing_address";
import type * as FxDefaultPaymentMethod from "./default_payment_method";
import type * as FxSubscriptions from "./subscriptions";
import type * as FxCustomer from "./customer";
import type * as FxStore from "./store";

export type Rel = "payment_method_expiring";
export type Curie = "fx:payment_method_expiring";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Related store resource. */
  "fx:store": FxStore.Links;
  /** Customer who this payment method belongs to. */
  "fx:customer": FxCustomer.Links;
  /** List of customer's subscriptions. */
  "fx:subscriptions": FxSubscriptions.Links;
  /** Customer's default payment method. */
  "fx:default_payment_method": FxDefaultPaymentMethod.Links;
  /** Customer's default billing address. */
  "fx:default_billing_address": FxDefaultBillingAddress.Links;
}

export interface Props {
  /** Months from today's day before this payment card will expire. */
  months_before_expiration: number;
  /** The customer's given name. */
  first_name: string;
  /** The customer's surname. */
  last_name: string;
  /** The customer's email address. */
  email: string;
  /** The credit card or debit card type. */
  cc_type: string;
  /** A masked version of this payment card showing only the last 4 digits. */
  cc_number_masked: string;
  /** The payment card expiration month in the MM format. */
  cc_exp_month: string;
  /** The payment card expiration year in the YYYY format. */
  cc_exp_year: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
