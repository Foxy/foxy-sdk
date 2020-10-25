import type * as FxDefaultPaymentMethod from "../integration/default_payment_method";

export interface Graph {
  curie: FxDefaultPaymentMethod.Graph["curie"];
  links: never;
  props: FxDefaultPaymentMethod.Graph["props"];
}
