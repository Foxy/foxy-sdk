import type { PropertyHelpers } from './property_helpers';
import type { Graph } from '../../core';

export interface CheckoutTypes extends Graph {
  curie: 'fx:checkout_types';

  links: {
    /** This resource. */
    'self': CheckoutTypes;
    /** Various pre-defined property values. */
    'fx:property_helpers': PropertyHelpers;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the checkout types supported. The key values are the values you use for the Store resource's `checkout_type` property. */
    values: Record<string, string>;
  };
}
