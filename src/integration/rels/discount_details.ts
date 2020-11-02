import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxDiscountDetail } from './discount_detail';

export interface FxDiscountDetails extends APIGraph {
  curie: 'fx:discount_details';
  links: APICollectionGraphLinks<FxDiscountDetails>;
  props: APICollectionGraphProps;
  child: FxDiscountDetail;
}
