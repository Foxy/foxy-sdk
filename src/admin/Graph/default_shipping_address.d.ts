import type { CustomerAddress } from './customer_address';
import type { Graph } from '../../core';

export interface DefaultShippingAddress extends Graph {
  curie: 'fx:default_shipping_address';
  links: CustomerAddress['links'];
  props: CustomerAddress['props'];
}
