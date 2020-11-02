import type { APIGraph } from '../../core/types';
import type { FxCustomerAddress } from './customer_address';

export interface FxDefaultShippingAddress extends APIGraph {
  curie: 'fx:default_shipping_address';
  links: FxCustomerAddress['links'];
  props: FxCustomerAddress['props'];
}
