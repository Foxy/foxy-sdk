import type { GiftCard } from './gift_card';
import type { GiftCardCode } from './gift_card_code';
import type { Graph } from '../../core';
import type { Store } from './store';
import type { Transaction } from './transaction';

export interface GiftCardCodeLog extends Graph {
  curie: 'fx:gift_card_code_log';

  links: {
    /** This resource. */
    'self': GiftCardCodeLog;
    /** Store this resource belongs to. */
    'fx:store': Store;
    /** Transaction involving the relevant gift card code. */
    'fx:transaction': Transaction;
    /** Gift card this log belongs to. */
    'fx:gift_card': GiftCard;
    /** Gift card code this log was created for. */
    'fx:gift_card_code': GiftCardCode;
  };

  props: {
    /** User id that made the change, for store admin or API initiated balance adjustments. Integer, optional. */
    user_id: number | null;
    /** External id associated with gift card. If you maintain gift card balances across multiple systems, you can use this field to track non-Foxy transactions. Optional. 50 characters or less. */
    external_id: string | null;
    /** The Foxy transaction ID associated with gift card usage. Integer, optional. */
    transaction_id: number | null;
    /** Balance adjustment for the gift card. Decimal, optional. */
    balance_adjustment: number | null;
    /** Source that made the change for the gift card. Readonly. */
    source: string | null;
    /** The date this resource was created. Readonly. */
    date_created: string | null;
    /** The date this resource was last modified. Readonly. */
    date_modified: string | null;
  };

  zooms: {
    gift_card?: GiftCard;
  };
}
