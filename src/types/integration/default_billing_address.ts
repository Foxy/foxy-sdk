import type * as FxCustomerAddress from "./customer_address";

type Curie = "fx:default_billing_address";
type Links = FxCustomerAddress.Graph;
type Props = FxCustomerAddress.Graph["props"];
type Zooms = FxCustomerAddress.Graph["zooms"];

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
