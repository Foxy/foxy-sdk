import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxCustomerAddress } from './customer_address';
import type { Graph } from '../../core';

export interface FxCustomerAddresses extends Graph {
  curie: 'fx:customer_addresses';
  links: CollectionGraphLinks<FxCustomerAddresses>;
  props: CollectionGraphProps;
  child: FxCustomerAddress;
}
