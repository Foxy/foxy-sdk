import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxAttribute } from './attribute';

export interface FxAttributes {
  curie: 'fx:attributes';
  links: CollectionLinks<FxAttributes>;
  props: CollectionProps;
  child: FxAttribute;
}
