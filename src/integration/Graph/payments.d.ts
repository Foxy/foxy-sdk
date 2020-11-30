import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Payment } from './payment';
import type { Graph } from '../../core';

export interface Payments extends Graph {
  curie: 'fx:payments';
  links: CollectionGraphLinks<Payments>;
  props: CollectionGraphProps;
  child: Payment;
}
