import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxShippingContainer } from './shipping_container';
import type { Graph } from '../../core';

export interface FxShippingContainers extends Graph {
  curie: 'fx:shipping_containers';
  links: CollectionGraphLinks<FxShippingContainers>;
  props: CollectionGraphProps;
  child: FxShippingContainer;
}
