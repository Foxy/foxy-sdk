import * as FxPaymentGateway from "./payment_gateway";

export type Rel = "hosted_payment_gateway";
export type Curie = "fx:hosted_payment_gateway";
export type Methods = FxPaymentGateway.Methods;
export type Links = FxPaymentGateway.Graph;
export type Props = FxPaymentGateway.Props;
export type Zooms = FxPaymentGateway.Zooms;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
