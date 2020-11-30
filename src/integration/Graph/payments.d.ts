import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { Payment } from './payment';

export interface Payments extends Graph {
  curie: 'fx:payments';
  links: CollectionGraphLinks<Payments>;
  props: CollectionGraphProps;
  child: Payment;
}
