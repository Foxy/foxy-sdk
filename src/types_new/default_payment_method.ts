import type * as FxCustomer from "./customer";
import type * as FxStore from "./store";

export type Rel = "default_payment_method";
export type Curie = "fx:default_payment_method";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Store the customer is registered in. */
  "fx:store": FxStore.Links;
  /** Customer using this payment method as default. */
  "fx:customer": FxCustomer.Links;
}

export interface Props {
  /** If the customer selected to save their payment information, this will be true. To clear out the payment information, set this to false. */
  save_cc: string;
  /** The credit card or debit card type. This will be determined automatically once the payment card is saved. */
  cc_type: string;
  /** The payment card number. This property will not be displayed as part of this resource, but can be used to modify this payment method. */
  cc_number: number;
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
