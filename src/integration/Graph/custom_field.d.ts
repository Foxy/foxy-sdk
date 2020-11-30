import type { Store } from './store';
import type { Transaction } from './transaction';
import type { Graph } from '../../core';

export interface CustomField extends Graph {
  curie: 'fx:custom_field';

  links: {
    /** This resource. */
    'self': CustomField;
    /** Store this custom field was created in. */
    'fx:store': Store;
    /** Transaction this custom field is linked to. */
    'fx:transaction': Transaction;
  };

  props: {
    /** The name of the custom field. */
    name: string;
    /** The value of this custom field. */
    value: string;
    /** Whether or not this custom field is visible on the receipt and email receipt. This correlates to custom fields with a "h:" prefix when added to the cart. */
    is_hidden: boolean;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
