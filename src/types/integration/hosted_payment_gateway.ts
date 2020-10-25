import * as FxPaymentGateway from "./payment_gateway";

type Curie = "fx:hosted_payment_gateway";
type Links = FxPaymentGateway.Graph;
type Props = FxPaymentGateway.Graph["props"];
type Zooms = FxPaymentGateway.Graph["zooms"];

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
