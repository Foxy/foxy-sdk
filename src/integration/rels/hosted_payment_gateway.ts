import { FxPaymentGateway } from "./payment_gateway";

export interface FxHostedPaymentGateway {
  curie: "fx:hosted_payment_gateway";
  links: FxPaymentGateway["links"];
  props: FxPaymentGateway["props"];
}
