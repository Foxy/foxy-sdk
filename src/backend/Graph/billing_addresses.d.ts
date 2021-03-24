import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { BillingAddress } from './billing_address';
import type { Graph } from '../../core';

export interface BillingAddresses extends Graph {
  curie: 'fx:billing_addresses';
  links: CollectionGraphLinks<BillingAddresses>;
  props: CollectionGraphProps;
  child: BillingAddress;
}
