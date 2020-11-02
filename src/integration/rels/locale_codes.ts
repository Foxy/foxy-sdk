import type { APIGraph } from '../../core/types';
import type { FxPropertyHelpers } from './property_helpers';

export interface FxLocaleCodes extends APIGraph {
  curie: 'fx:locale_codes';

  links: {
    /** This resource. */
    'self': FxLocaleCodes;
    /** Various predefined property values. */
    'fx:property_helpers': FxPropertyHelpers;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the locale codes supported. The key values are the values you use for the Store resource's `locale_code` property. */
    values: Record<string, string>;
  };
}
