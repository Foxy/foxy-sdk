import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxShippingDropType } from './shipping_drop_type';

export interface FxShippingDropTypes extends APIGraph {
  curie: 'fx:shipping_drop_types';
  links: APICollectionGraphLinks<FxShippingDropTypes>;
  props: APICollectionGraphProps;
  child: FxShippingDropType;
}
