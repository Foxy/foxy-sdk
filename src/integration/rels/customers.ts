import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxCustomer } from './customer';

export interface FxCustomers extends APIGraph {
  curie: 'fx:customers';
  links: APICollectionGraphLinks<FxCustomers>;
  props: APICollectionGraphProps;
  child: FxCustomer;
}
