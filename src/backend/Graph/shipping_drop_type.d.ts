import type { Graph } from '../../core';
import type { PropertyHelpers } from './property_helpers';
import type { ShippingDropTypes } from './shipping_drop_types';
import type { ShippingMethod } from './shipping_method';
import type { ShippingMethods } from './shipping_methods';

export interface ShippingDropType extends Graph {
  curie: 'fx:shipping_drop_type';

  links: {
    /** This resource. */
    'self': ShippingDropType;
    /** Shipping method that will be used to deliver this container. */
    'fx:shipping_method': ShippingMethod;
    /** List of all available shipping methods. */
    'fx:shipping_methods': ShippingMethods;
    /** Various predefined property values. */
    'fx:property_helpers': PropertyHelpers;
    /** List of all drop types for the shipping method. */
    'fx:shipping_drop_types': ShippingDropTypes;
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
