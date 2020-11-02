import type { APIGraph } from '../../core/types';
import type { FxDefaultShippingAddress as IntegrationAPIFxDefaultShippingAddress } from '../../integration/rels/default_shipping_address';

export interface FxDefaultShippingAddress extends APIGraph {
  curie: IntegrationAPIFxDefaultShippingAddress['curie'];
  props: IntegrationAPIFxDefaultShippingAddress['props'];
}
