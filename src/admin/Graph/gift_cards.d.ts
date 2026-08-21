import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { GiftCard } from './gift_card';
import type { Graph } from '../../core';

export interface GiftCards extends Graph {
  curie: 'fx:gift_cards';
  links: CollectionGraphLinks<GiftCards>;
  props: CollectionGraphProps;
  child: GiftCard;
}
