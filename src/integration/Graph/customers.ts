import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxCustomer } from './customer';
import type { Graph } from '../../core';

export interface FxCustomers extends Graph {
  curie: 'fx:customers';
  links: CollectionGraphLinks<FxCustomers>;
  props: CollectionGraphProps;
  child: FxCustomer;
}
