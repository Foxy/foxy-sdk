import type { Graph } from '../../core';
import type { PropertyHelpers } from './property_helpers';

export interface Languages extends Graph {
  curie: 'fx:languages';

  links: {
    /** This resource. */
    'self': Languages;
    /** Various predefined property values. */
    'fx:property_helpers': PropertyHelpers;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the languages supported. The key values are the values you use for the Store resource's language property. */
    values: Record<string, string>;
  };
}
