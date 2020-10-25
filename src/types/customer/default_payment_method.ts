import type * as IntegrationAPIFxDefaultPaymentMethod from "../integration/default_payment_method";

export interface FxDefaultPaymentMethod {
  curie: IntegrationAPIFxDefaultPaymentMethod.Graph["curie"];
  links: never;
  props: IntegrationAPIFxDefaultPaymentMethod.Graph["props"];
}
