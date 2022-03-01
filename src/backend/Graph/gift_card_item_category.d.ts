import type { GiftCard } from './gift_card';
import type { Graph } from '../../core';
import type { ItemCategory } from './item_category';
import type { Store } from './store';

export interface GiftCardItemCategory extends Graph {
  curie: 'fx:gift_card_item_category';

  links: {
    /** This resource. */
    'self': GiftCardItemCategory;
    /** Store the gift card belongs to. */
    'fx:store': Store;
    /** Gift card this category belongs to. */
    'fx:gift_card': GiftCard;
    /** Item category this resource links to. */
    'fx:item_category': ItemCategory;
  };

  props: {
    /** The full API URI of the gift card associated with this gift card item category. */
    gift_card_uri: string;
    /** The full API URI of the item category associated with this gift card item category. */
    item_category_uri: string;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
