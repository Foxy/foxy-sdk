import type * as FxDefaultShippingAddress from "../integration/default_shipping_address";

export interface Graph {
  curie: FxDefaultShippingAddress.Graph["curie"];
  links: never;
  props: FxDefaultShippingAddress.Graph["props"];
}
