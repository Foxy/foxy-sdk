import type { Graph } from '../../core';
import type { PropertyHelpers } from './property_helpers';

export interface CustomerPasswordHashTypes extends Graph {
  curie: 'fx:customer_password_hash_types';

  links: {
    /** This resource. */
    'self': CustomerPasswordHashTypes;
    /** Various pre-defined property values. */
    'fx:property_helpers': PropertyHelpers;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the password hash type as the object key. This key is the value you use for the Store resource's `customer_password_hash_type` property and the Customer resource's `password_hash_type` property. */
    values: {
      [key: string]: {
        /** The human readable description of this password hashing mechanism. */
        description: string;
        /** The default configuration settings specific to this hashing mechanism. */
        config: unknown;
      };
    };
  };
}
