import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { GiftCardItemCategory } from './gift_card_item_category';
import type { Graph } from '../../core';

export interface GiftCardItemCategories extends Graph {
  curie: 'fx:gift_card_item_categories';
  links: CollectionGraphLinks<GiftCardItemCategories>;
  props: CollectionGraphProps;
  child: GiftCardItemCategory;
}
