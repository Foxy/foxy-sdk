import type { FxCustomerAddress } from './customer_address';

export interface FxDefaultShippingAddress {
  curie: 'fx:default_shipping_address';
  links: FxCustomerAddress['links'];
  props: FxCustomerAddress['props'];
}
