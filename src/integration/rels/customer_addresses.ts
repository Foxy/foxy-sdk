import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxCustomerAddress } from './customer_address';

export interface FxCustomerAddresses extends APIGraph {
  curie: 'fx:customer_addresses';
  links: APICollectionGraphLinks<FxCustomerAddresses>;
  props: APICollectionGraphProps;
  child: FxCustomerAddress;
}
