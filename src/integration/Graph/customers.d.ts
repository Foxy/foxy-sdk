import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Customer } from './customer';
import type { Graph } from '../../core';

export interface Customers extends Graph {
  curie: 'fx:customers';
  links: CollectionGraphLinks<Customers>;
  props: CollectionGraphProps;
  child: Customer;
}
