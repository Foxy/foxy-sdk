import type { CollectionLinks, CollectionProps } from "../index";
import type { FxCustomerAddress } from "./customer_address";

export interface FxCustomerAddresses {
  curie: "fx:customer_addresses";
  links: CollectionLinks<FxCustomerAddresses>;
  props: CollectionProps;
  child: FxCustomerAddress;
}
