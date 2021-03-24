import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { CustomerAddress } from './customer_address';
import type { Graph } from '../../core';

export interface CustomerAddresses extends Graph {
  curie: 'fx:customer_addresses';
  links: CollectionGraphLinks<CustomerAddresses>;
  props: CollectionGraphProps;
  child: CustomerAddress;
}
