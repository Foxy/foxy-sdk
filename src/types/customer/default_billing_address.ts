import type * as FxDefaultBillingAddress from "../integration/default_billing_address";

export interface Graph {
  curie: FxDefaultBillingAddress.Graph["curie"];
  links: never;
  props: FxDefaultBillingAddress.Graph["props"];
}
