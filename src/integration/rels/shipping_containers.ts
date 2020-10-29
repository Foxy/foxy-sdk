import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxShippingContainer } from './shipping_container';

export interface FxShippingContainers {
  curie: 'fx:shipping_containers';
  links: CollectionLinks<FxShippingContainers>;
  props: CollectionProps;
  child: FxShippingContainer;
}
