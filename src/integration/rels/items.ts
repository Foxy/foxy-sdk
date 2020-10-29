import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxItem } from './item';

export interface FxItems {
  curie: 'fx:items';
  links: CollectionLinks<FxItems>;
  props: CollectionProps;
  child: FxItem;
}
