import type { Attributes } from './attributes';
import type { Customer } from './customer';
import type { Graph } from '../../core';
import type { LastTransaction } from './last_transaction';
import type { OriginalTransaction } from './original_transaction';
import type { Store } from './store';
import type { SubTokenUrl } from './sub_token_url';
import type { TransactionTemplate } from './transaction_template';
import type { Transactions } from './transactions';

export interface Subscription extends Graph {
  curie: 'fx:subscription';

  links: {
    /** This resource. */
    'self': Subscription;
    /** List of attributes for this subscription. */
    'fx:attributes': Attributes;
    /** Related store resource. */
    'fx:store': Store;
    /** Customer who created this subscription. */
    'fx:customer': Customer;
    /** Last transaction for this subscription. */
    'fx:last_transaction': LastTransaction;
    /** List of transactions for this subscription. */
    'fx:transactions': Transactions;
    /** Transaction template for this subscription. */
    'fx:transaction_template': TransactionTemplate;
    /** Open this link in browser to load up the subscription template into a full HTML cart for the store. */
    'fx:sub_token_url': SubTokenUrl;
  };

  props: {
    /** The original date this subscription began or will begin if set in the future. */
    start_date: string;
    /** The date for when this subscription will run again. */
    next_transaction_date: string;
    /** If set, the date this subscription will end. The subscription will not run on this day. */
    end_date: string | null;
    /** This determines how often this subscription will be processed. The format is a number followed by a date type such as d (day), w (week), m (month), or y (year). You can also use .5m for twice a month. */
    frequency: string;
    /** If the last run of this subscription encountered an error, that error message will be saved here. It will also note if a past due payment was made. */
    error_message: string;
    /** If a subscription payment is missed, this amount will be increased by that payment. The next time the subscription runs, it will be charged automatically, depending on your store's subscription settings. */
    past_due_amount: number;
    /** If this subscription failed to process due to an error such as expired payment card, this field will show the first date the subscription failed to process. If it processes successfully at the next attempt, this field will be cleared. */
    first_failed_transaction_date: string | null;
    /** Determines whether or not this transaction is active or not. If you are using the subscription datafeed, it is best to set the end_date to tomorrow instead of settings this to inactive. */
    is_active: boolean;
    /** If this subscription is using a third party subscription system such as PayPal Express, their identifier will be set here. */
    third_party_id: string;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };

  zooms: {
    original_transaction?: OriginalTransaction;
    transaction_template?: TransactionTemplate;
    last_transaction?: LastTransaction;
    transactions?: Transactions;
    attributes: Attributes;
    customer?: Customer;
  };
}
