import type { CollectionLinks, CollectionProps } from "../index";
import type { FxPaymentMethodSetHostedPaymentGateway } from "./payment_method_set_hosted_payment_gateway";

export interface FxPaymentMethodSetHostedPaymentGateways {
  curie: "fx:payment_method_set_hosted_payment_gateways";
  links: CollectionLinks<FxPaymentMethodSetHostedPaymentGateways>;
  props: CollectionProps;
  child: FxPaymentMethodSetHostedPaymentGateway;
}
