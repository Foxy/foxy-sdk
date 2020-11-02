import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxPayment } from './payment';

export interface FxPayments extends APIGraph {
  curie: 'fx:payments';
  links: APICollectionGraphLinks<FxPayments>;
  props: APICollectionGraphProps;
  child: FxPayment;
}
