import type { Graph } from '../../core';
import type { PropertyHelpers } from './property_helpers';
import type { ShippingContainers } from './shipping_containers';
import type { ShippingDropTypes } from './shipping_drop_types';
import type { ShippingMethods } from './shipping_methods';
import type { ShippingServices } from './shipping_services';

export interface ShippingMethod extends Graph {
  curie: 'fx:shipping_method';

  links: {
    /** This resource. */
    'self': ShippingMethod;
    /** List of all available shipping methods. */
    'fx:shipping_methods': ShippingMethods;
    /** Various predefined property values. */
    'fx:property_helpers': PropertyHelpers;
    /** List of available shipping services for this shipping method. */
    'fx:shipping_services': ShippingServices;
    /** List of available shipping containers for this shipping method. */
    'fx:shipping_containers': ShippingContainers;
    /** List of available shipping drop types for this shipping method. */
    'fx:shipping_drop_types': ShippingDropTypes;
  };

  props: {
    /** The name of this shipping method */
    name: string;
    /** The code for this shipping method */
    code: string;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
