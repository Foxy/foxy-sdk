import type { Graph } from '../../core';
import type { Store } from './store';
import type { Tax } from './tax';
import type { Transaction } from './transaction';

export interface AppliedTax extends Graph {
  curie: 'fx:applied_tax';

  links: {
    /** This resource. */
    'self': AppliedTax;
    /** Tax configuration. */
    'fx:tax': Tax;
    /** Store that handled the transaction this tax applies to. */
    'fx:store': Store;
    /** Transaction this tax applies to. */
    'fx:transaction': Transaction;
  };

  props: {
    /** The tax rate as a percentage for this applied tax. As an example, a 9.75% tax rate would be displayed as 9.75. */
    rate: number;
    /** The original tax name of this tax. */
    name: string;
    /** The amount of tax applied to the transaction. Note, this amount is not rounded to the specific currency decimal precision. */
    amount: number;
    /** Whether or not this tax was also applied to the handling fees for the transaction. */
    apply_to_handling: boolean;
    /** Whether or not this tax was also applied to the shipping fees for the transaction. */
    apply_to_shipping: boolean;
    /** Whether or not this applied tax is part of a subscription that is to be charged in the future based on when this transaction was processed. */
    is_future_tax: boolean;
    /** If this tax only applied to a specific shipto shipment, the shipto address name will be listed here. */
    shipto: string;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
