import type { CustomerAddress } from './customer_address';
import type { Graph } from '../../core';

export interface DefaultBillingAddress extends Graph {
  curie: 'fx:default_billing_address';
  links: CustomerAddress['links'] & { self: DefaultBillingAddress };
  props: CustomerAddress['props'];
}
