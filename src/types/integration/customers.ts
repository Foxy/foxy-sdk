import type { CollectionLinks, CollectionProps } from "../index";
import type { FxCustomer } from "./customer";

export interface FxCustomers {
  curie: "fx:customers";
  links: CollectionLinks<FxCustomers>;
  props: CollectionProps;
  child: FxCustomer;
}
