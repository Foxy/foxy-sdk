import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxShippingDropType } from './shipping_drop_type';
import type { Graph } from '../../core';

export interface FxShippingDropTypes extends Graph {
  curie: 'fx:shipping_drop_types';
  links: CollectionGraphLinks<FxShippingDropTypes>;
  props: CollectionGraphProps;
  child: FxShippingDropType;
}
