import type { APIGraph } from '../../core/types';
import type { FxPropertyHelpers } from './property_helpers';
import type { FxShippingContainers } from './shipping_containers';
import type { FxShippingMethod } from './shipping_method';
import type { FxShippingMethods } from './shipping_methods';

export interface FxShippingContainer extends APIGraph {
  curie: 'fx:shipping_container';

  links: {
    /** This resource. */
    'self': FxShippingContainer;
    /** Shipping method that will be used to deliver this container. */
    'fx:shipping_method': FxShippingMethod;
    /** List of all available shipping methods. */
    'fx:shipping_methods': FxShippingMethods;
    /** Various predefined property values. */
    'fx:property_helpers': FxPropertyHelpers;
    /** List of all shipping containers for the shipping method. */
    'fx:shipping_containers': FxShippingContainers;
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
