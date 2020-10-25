import type * as FxCustomerAddress from "./customer_address";

export type Rel = "default_billing_address";
export type Curie = "fx:default_billing_address";
export type Methods = FxCustomerAddress.Methods;
export type Links = FxCustomerAddress.Graph;
export type Props = FxCustomerAddress.Props;
export type Zooms = FxCustomerAddress.Zooms;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
