import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxShippingMethod } from './shipping_method';

export interface FxShippingMethods {
  curie: 'fx:shipping_methods';
  links: CollectionLinks<FxShippingMethods>;
  props: CollectionProps;
  child: FxShippingMethod;
}
