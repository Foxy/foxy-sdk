import type { CollectionLinks, CollectionProps } from "../index";
import type { FxBillingAddress } from "./billing_address";

export interface FxBillingAddresses {
  curie: "fx:billing_addresses";
  links: CollectionLinks<FxBillingAddresses>;
  props: CollectionProps;
  child: FxBillingAddress;
}
