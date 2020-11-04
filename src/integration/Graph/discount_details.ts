import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxDiscountDetail } from './discount_detail';
import type { Graph } from '../../core';

export interface FxDiscountDetails extends Graph {
  curie: 'fx:discount_details';
  links: CollectionGraphLinks<FxDiscountDetails>;
  props: CollectionGraphProps;
  child: FxDiscountDetail;
}
