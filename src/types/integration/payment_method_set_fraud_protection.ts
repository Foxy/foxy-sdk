import type * as FxPaymentMethodSet from "./payment_method_set";
import type * as FxFraudProtection from "./fraud_protection";
import type * as FxStore from "./store";

type Curie = "fx:payment_method_set_fraud_protection";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Store this configuration belongs to. */
  "fx:store": FxStore.Graph;
  /** Fraud protection configuration. */
  "fx:fraud_protection": FxFraudProtection.Graph;
  /** Payment method set configuration. */
  "fx:payment_method_set": FxPaymentMethodSet.Graph;
}

interface Props {
  /** The full API URI of the payment method set associated with this payment method set fraud protection. */
  payment_method_set_uri: string;
  /** The full API URI of the fraud protection associated with this payment method set fraud protection. */
  fraud_protection_uri: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
