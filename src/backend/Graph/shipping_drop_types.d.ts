import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { ShippingDropType } from './shipping_drop_type';

export interface ShippingDropTypes extends Graph {
  curie: 'fx:shipping_drop_types';
  links: CollectionGraphLinks<ShippingDropTypes>;
  props: CollectionGraphProps;
  child: ShippingDropType;
}
