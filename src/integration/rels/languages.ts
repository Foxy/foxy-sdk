import type { FxPropertyHelpers } from './property_helpers';

export interface FxLanguages {
  curie: 'fx:languages';

  links: {
    /** This resource. */
    'self': FxLanguages;
    /** Various predefined property values. */
    'fx:property_helpers': FxPropertyHelpers;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the languages supported. The key values are the values you use for the Store resource's language property. */
    values: Record<string, string>;
  };
}
