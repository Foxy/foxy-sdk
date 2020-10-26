import type { FxCustomerAddress } from "./customer_address";

export interface FxDefaultBillingAddress {
  curie: "fx:default_billing_address";
  links: FxCustomerAddress["links"];
  props: FxCustomerAddress["props"];
}
