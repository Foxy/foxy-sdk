import type { FxDefaultPaymentMethod as IntegrationAPIFxDefaultPaymentMethod } from "../integration/default_payment_method";

export interface FxDefaultPaymentMethod {
  curie: IntegrationAPIFxDefaultPaymentMethod["curie"];
  links: never;
  props: IntegrationAPIFxDefaultPaymentMethod["props"];
}
