import type { FxPropertyHelpers } from './property_helpers';

export interface FxTimezones {
  curie: 'fx:timezones';

  links: {
    /** This resource. */
    'self': FxTimezones;
    /** Various predefined property values. */
    'fx:property_helpers': FxPropertyHelpers;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON object with an array of timezones. */
    values: {
      /** Valid entries for the store resource's timezone property. */
      timezone: {
        /** The value you can use for the store's timezone property. */
        timezone: string;
        /** The full description of this timezone. */
        description: string;
      }[];
    };
  };
}
