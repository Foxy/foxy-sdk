import type { GenerateCodes } from './generate_codes';
import type { GiftCardCodes } from './gift_card_codes';
import type { GiftCardItemCategories } from './gift_card_item_categories';
import type { Graph } from '../../core';
import type { Store } from './store';

export interface GiftCard extends Graph {
  curie: 'fx:gift_card';

  links: {
    /** This resource. */
    'self': GiftCard;
    /** Store this gift card is assigned to. */
    'fx:store': Store;
    /** POST here to generate random gift card codes. */
    'fx:generate_codes': GenerateCodes;
    /** Collection of codes for this gift card. */
    'fx:gift_card_codes': GiftCardCodes;
    /** Collection of item category to gift card mappings for this card. */
    'fx:gift_card_item_categories': GiftCardItemCategories;
  };

  props: {
    /** The name of this gift card. This will be displayed to the customer, such as "Gift Card" or "Store Credit". Required. 50 characters or less. */
    name: string;
    /** Currency code for this gift card. Note that gift cards are only usable if the cart's currency matches. Optional. The 3 character ISO code for the currency. */
    currency_code: string;
    /** This determines when the gift card will expire. The format is a number followed by a date type such as `d` (day), `w` (week), `m` (month), or `y` (year). You can also use `.5m` for twice a month, as with subscription frequency settings. Check with your local laws to ensure expiring gift cards is legal, according to your use case. The actual expiration date will be set on the `gift_card_code` resources when they are created, according to this setting. Optional. If present, the format must be valid, such as `1m`, `3w`, `45d`, etc. */
    expires_after: string | null;
    /** If you want to limit which products can use this gift card, you can enter a comma separated listed of product codes or partial product codes using `*` as a wild card at the beginning or end of the value. So `abc123`, `fun_*`, `*-small` would match `abc123`, `fun_` and `fun_times`, and `example-small`. It wouldn't match `abc12`, `abc1234`, `fun`, or `good-smalls`. Optional. 5000 characters or less. */
    product_code_restrictions: string | null;
    /** The date this resource was created. ISO date. Read only. */
    date_created: string | null;
    /** The date this resource was last modified. ISO date. Read only. */
    date_modified: string | null;
  };

  zooms: {
    gift_card_codes?: GiftCardCodes;
    gift_card_item_categories?: GiftCardItemCategories;
  };
}
