import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxShippingDropType } from './shipping_drop_type';

export interface FxShippingDropTypes {
  curie: 'fx:shipping_drop_types';
  links: CollectionLinks<FxShippingDropTypes>;
  props: CollectionProps;
  child: FxShippingDropType;
}
