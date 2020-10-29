import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxBillingAddress } from './billing_address';

export interface FxBillingAddresses {
  curie: 'fx:billing_addresses';
  links: CollectionLinks<FxBillingAddresses>;
  props: CollectionProps;
  child: FxBillingAddress;
}
