import type { FxCustomerAddress } from './customer_address';
import type { Graph } from '../../core';

export interface FxDefaultBillingAddress extends Graph {
  curie: 'fx:default_billing_address';
  links: FxCustomerAddress['links'];
  props: FxCustomerAddress['props'];
}
