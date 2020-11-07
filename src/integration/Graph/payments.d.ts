import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxPayment } from './payment';
import type { Graph } from '../../core';

export interface FxPayments extends Graph {
  curie: 'fx:payments';
  links: CollectionGraphLinks<FxPayments>;
  props: CollectionGraphProps;
  child: FxPayment;
}
