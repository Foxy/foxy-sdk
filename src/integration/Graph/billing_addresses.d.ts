import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxBillingAddress } from './billing_address';
import type { Graph } from '../../core';

export interface FxBillingAddresses extends Graph {
  curie: 'fx:billing_addresses';
  links: CollectionGraphLinks<FxBillingAddresses>;
  props: CollectionGraphProps;
  child: FxBillingAddress;
}
