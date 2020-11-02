import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxBillingAddress } from './billing_address';

export interface FxBillingAddresses extends APIGraph {
  curie: 'fx:billing_addresses';
  links: APICollectionGraphLinks<FxBillingAddresses>;
  props: APICollectionGraphProps;
  child: FxBillingAddress;
}
