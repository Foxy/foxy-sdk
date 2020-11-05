import type { FxShippingMethod } from './shipping_method';
import type { FxShippingMethods } from './shipping_methods';
import type { FxShippingService } from './shipping_service';
import type { FxShippingServices } from './shipping_services';
import type { FxStore } from './store';
import type { Graph } from '../../core';

export interface FxStoreShippingService extends Graph {
  curie: 'fx:store_shipping_service';

  links: {
    /** This resource. */
    'self': FxStoreShippingService;
    /** Related store resource. */
    'fx:store': FxStore;
    /** Shipping method linked to this shipping service. */
    'fx:shipping_method': FxShippingMethod;
    /** Related shipping service. */
    'fx:shipping_service': FxShippingService;
    /** List of all available shipping methods. */
    'fx:shipping_methods': FxShippingMethods;
    /** List of all available shipping services for this shipping method. */
    'fx:shipping_services': FxShippingServices;
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
