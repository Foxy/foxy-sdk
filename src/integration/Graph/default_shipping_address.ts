import type { FxCustomerAddress } from './customer_address';
import type { Graph } from '../../core';

export interface FxDefaultShippingAddress extends Graph {
  curie: 'fx:default_shipping_address';
  links: FxCustomerAddress['links'];
  props: FxCustomerAddress['props'];
}
