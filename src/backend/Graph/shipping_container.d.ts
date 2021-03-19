import type { Graph } from '../../core';
import type { PropertyHelpers } from './property_helpers';
import type { ShippingContainers } from './shipping_containers';
import type { ShippingMethod } from './shipping_method';
import type { ShippingMethods } from './shipping_methods';

export interface ShippingContainer extends Graph {
  curie: 'fx:shipping_container';

  links: {
    /** This resource. */
    'self': ShippingContainer;
    /** Shipping method that will be used to deliver this container. */
    'fx:shipping_method': ShippingMethod;
    /** List of all available shipping methods. */
    'fx:shipping_methods': ShippingMethods;
    /** Various predefined property values. */
    'fx:property_helpers': PropertyHelpers;
    /** List of all shipping containers for the shipping method. */
    'fx:shipping_containers': ShippingContainers;
  };

  props: {
    /** The name of this shipping container */
    name: string;
    /** The code for this shipping container */
    code: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
