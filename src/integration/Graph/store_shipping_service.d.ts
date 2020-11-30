import type { ShippingMethod } from './shipping_method';
import type { ShippingMethods } from './shipping_methods';
import type { ShippingService } from './shipping_service';
import type { ShippingServices } from './shipping_services';
import type { Store } from './store';
import type { Graph } from '../../core';

export interface StoreShippingService extends Graph {
  curie: 'fx:store_shipping_service';

  links: {
    /** This resource. */
    'self': StoreShippingService;
    /** Related store resource. */
    'fx:store': Store;
    /** Shipping method linked to this shipping service. */
    'fx:shipping_method': ShippingMethod;
    /** Related shipping service. */
    'fx:shipping_service': ShippingService;
    /** List of all available shipping methods. */
    'fx:shipping_methods': ShippingMethods;
    /** List of all available shipping services for this shipping method. */
    'fx:shipping_services': ShippingServices;
  };

  props: {
    /** The full API URI of the shipping method defined in our property helpers. */
    shipping_method_uri: string;
    /** The full API URI of the shipping method shipping service defined in our property helpers. Each shipping method will have it's own shipping services. */
    shipping_service_uri: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
