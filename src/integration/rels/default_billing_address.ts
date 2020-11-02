import type { APIGraph } from '../../core/types';
import type { FxCustomerAddress } from './customer_address';

export interface FxDefaultBillingAddress extends APIGraph {
  curie: 'fx:default_billing_address';
  links: FxCustomerAddress['links'];
  props: FxCustomerAddress['props'];
}
