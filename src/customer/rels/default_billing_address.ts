import { APIGraph } from '../../core/types';
import type { FxDefaultBillingAddress as IntegrationAPIFxDefaultBillingAddress } from '../../integration/rels/default_billing_address';

export interface FxDefaultBillingAddress extends APIGraph {
  curie: IntegrationAPIFxDefaultBillingAddress['curie'];
  props: IntegrationAPIFxDefaultBillingAddress['props'];
}
