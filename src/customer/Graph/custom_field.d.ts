import type { Graph } from '../../core';
import type { Transaction } from './transaction';

export interface CustomField extends Graph {
  curie: 'fx:custom_field';

  links: {
    /** This resource. */
    'self': CustomField;
    /** Transaction this custom field is linked to. */
    'fx:transaction': Transaction;
  };

  props: {
    /** The name of the custom field. */
    name: string;
    /** The value of this custom field. */
    value: string;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
