import type { APIGraph } from '../../core/types';
import type { FxDefaultPaymentMethod as IntegrationAPIFxDefaultPaymentMethod } from '../../integration/rels/default_payment_method';

export interface FxDefaultPaymentMethod extends APIGraph {
  curie: IntegrationAPIFxDefaultPaymentMethod['curie'];
  props: IntegrationAPIFxDefaultPaymentMethod['props'];
}
