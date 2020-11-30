import type { PropertyHelpers } from './property_helpers';
import type { Graph } from '../../core';

export interface LocaleCodes extends Graph {
  curie: 'fx:locale_codes';

  links: {
    /** This resource. */
    'self': LocaleCodes;
    /** Various predefined property values. */
    'fx:property_helpers': PropertyHelpers;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the locale codes supported. The key values are the values you use for the Store resource's `locale_code` property. */
    values: Record<string, string>;
  };
}
