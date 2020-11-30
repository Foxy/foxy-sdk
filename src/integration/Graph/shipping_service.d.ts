import type { PropertyHelpers } from './property_helpers';
import type { ShippingMethod } from './shipping_method';
import type { ShippingMethods } from './shipping_methods';
import type { Graph } from '../../core';

export interface ShippingService extends Graph {
  curie: 'fx:shipping_service';

  links: {
    /** This resource. */
    'self': ShippingService;
    /** Shipping method associated with this shipping service. */
    'fx:shipping_method': ShippingMethod;
    /** List of all available shipping methods. */
    'fx:shipping_methods': ShippingMethods;
    /** Various predefined property values. */
    'fx:property_helpers': PropertyHelpers;
  };

  props: {
    /** The name of this shipping service */
    name: string;
    /** The code for this shipping service */
    code: string;
    /** Specifies whether or not this shipping service is for international rate requests only. */
    is_international: boolean;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
