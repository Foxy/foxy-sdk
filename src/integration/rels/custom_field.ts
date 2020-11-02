import type { APIGraph } from '../../core/types';
import type { FxStore } from './store';
import type { FxTransaction } from './transaction';

export interface FxCustomField extends APIGraph {
  curie: 'fx:custom_field';

  links: {
    /** This resource. */
    'self': FxCustomField;
    /** Store this custom field was created in. */
    'fx:store': FxStore;
    /** Transaction this custom field is linked to. */
    'fx:transaction': FxTransaction;
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
