import type { FxTransaction } from './transaction';
import type { FxStore } from './store';
import type { FxItem } from './item';

export interface FxItemOption {
  curie: 'fx:item_option';

  links: {
    /** This resource. */
    'self': FxItemOption;
    /** Item this option is attached to. */
    'fx:item': FxItem;
    /** Store the item belongs to. */
    'fx:store': FxStore;
    /** Related transaction resource. */
    'fx:transaction': FxTransaction;
  };

  props: {
    /** The name of this item option. */
    name: string;
    /** The value of this item option. */
    value: string;
    /** The price modifier for this item option. The price of the item in the cart will be adjusted by this amount because of this item option. */
    price_mod: number;
    /** The weight modifier for this item option. The weight of the item in the cart will be adjusted by this amount because of this item option. */
    weight_mod: number;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
