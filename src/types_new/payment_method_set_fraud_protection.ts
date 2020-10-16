import type * as FxPaymentMethodSet from "./payment_method_set";
import type * as FxFraudProtection from "./fraud_protection";
import type * as FxStore from "./store";

export type Rel = "payment_method_set_fraud_protection";
export type Curie = "fx:payment_method_set_fraud_protection";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Store this configuration belongs to. */
  "fx:store": FxStore.Links;
  /** Fraud protection configuration. */
  "fx:fraud_protection": FxFraudProtection.Links;
  /** Payment method set configuration. */
  "fx:payment_method_set": FxPaymentMethodSet.Links;
}

export interface Props {
  /** The full API URI of the payment method set associated with this payment method set fraud protection. */
  payment_method_set_uri: string;
  /** The full API URI of the fraud protection associated with this payment method set fraud protection. */
  fraud_protection_uri: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
