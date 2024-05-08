import type { Customer } from './customer';
import type { GiftCard } from './gift_card';
import type { GiftCardCodeLogs } from './gift_card_code_logs';
import type { Graph } from '../../core';
import type { Store } from './store';
import type { Transaction } from './transaction';

export interface GiftCardCode extends Graph {
  curie: 'fx:gift_card_code';

  links: {
    /** This resource. */
    'self': GiftCardCode;
    /** Store this gift card code belongs to. */
    'fx:store': Store;
    /** Customer this gift card belongs to. */
    'fx:customer': Customer;
    /** Gift card this code corresponds to. */
    'fx:gift_card': GiftCard;
    /** Transactions using this gift card code. */
    'fx:gift_card_code_logs': GiftCardCodeLogs;
    /** Transaction that resulted in the creation of this gift card code, if applicable. */
    'fx:provisioned_by_transaction_detail_id': Transaction;
  };

  props: {
    /** The string value of this gift card code which your customer will add to their cart to use this gift card. Required. 50 characters or less. */
    code: string;
    /** The date when this gift card code will expire. ISO date. Optional. */
    end_date: string | null;
    /** Current balance on the gift card. Decimal. Required. */
    current_balance: number;
    /** PATCH-only: use this field to link this gift card code to a customer. */
    customer_id?: number | string;
    /** The date this resource was created. Readonly. */
    date_created: string | null;
    /** The date this resource was last modified. Readonly. */
    date_modified: string | null;
  };
}
