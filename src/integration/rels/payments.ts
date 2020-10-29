import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxPayment } from './payment';

export interface FxPayments {
  curie: 'fx:payments';
  links: CollectionLinks<FxPayments>;
  props: CollectionProps;
  child: FxPayment;
}
