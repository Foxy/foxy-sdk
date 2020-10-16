import type * as FxHostedPaymentGateway from "./hosted_payment_gateway";
import type * as FxPaymentMethodSet from "./payment_method_set";
import type * as FxStore from "./store";

export type Rel = "payment_method_set_hosted_payment_gateway";
export type Curie = "fx:payment_method_set_hosted_payment_gateway";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Related store resource. */
  "fx:store": FxStore.Links;
  /** Linked payment method set.  */
  "fx:payment_method_set": FxPaymentMethodSet.Links;
  /** Linked hosted payment gateway. */
  "fx:hosted_payment_gateway": FxHostedPaymentGateway.Links;
}

export interface Props {
  /** The full API URI of the payment method set associated with this payment method set hosted payment gateway. */
  payment_method_set_uri: string;
  /** The full API URI of the hosted payment gateway associated with this payment method set hosted payment gateway. */
  hosted_payment_gateway_uri: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
