import type { FxShippingDropTypes } from './shipping_drop_types';
import type { FxPropertyHelpers } from './property_helpers';
import type { FxShippingMethods } from './shipping_methods';
import type { FxShippingMethod } from './shipping_method';

export interface FxShippingDropType {
  curie: 'fx:shipping_drop_type';

  links: {
    /** This resource. */
    'self': FxShippingDropType;
    /** Shipping method that will be used to deliver this container. */
    'fx:shipping_method': FxShippingMethod;
    /** List of all available shipping methods. */
    'fx:shipping_methods': FxShippingMethods;
    /** Various predefined property values. */
    'fx:property_helpers': FxPropertyHelpers;
    /** List of all drop types for the shipping method. */
    'fx:shipping_drop_types': FxShippingDropTypes;
  };

  props: {
    /** The name of this shipping drop type */
    name: string;
    /** The code for this shipping drop type */
    code: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
