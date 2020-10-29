import type { FxPropertyHelpers } from './property_helpers';

export interface FxCheckoutTypes {
  curie: 'fx:checkout_types';

  links: {
    /** This resource. */
    'self': FxCheckoutTypes;
    /** Various pre-defined property values. */
    'fx:property_helpers': FxPropertyHelpers;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the checkout types supported. The key values are the values you use for the Store resource's `checkout_type` property. */
    values: Record<string, string>;
  };
}
