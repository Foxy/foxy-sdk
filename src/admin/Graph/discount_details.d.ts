import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { DiscountDetail } from './discount_detail';
import type { Graph } from '../../core';

export interface DiscountDetails extends Graph {
  curie: 'fx:discount_details';
  links: CollectionGraphLinks<DiscountDetails>;
  props: CollectionGraphProps;
  child: DiscountDetail;
}
