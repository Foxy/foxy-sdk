import type { FxShippingContainers } from "./shipping_containers";
import type { FxShippingDropTypes } from "./shipping_drop_types";
import type { FxShippingServices } from "./shipping_services";
import type { FxShippingMethods } from "./shipping_methods";
import type { FxPropertyHelpers } from "./property_helpers";

export interface FxShippingMethod {
  curie: "fx:shipping_method";

  links: {
    /** This resource. */
    "self": FxShippingMethod;
    /** List of all available shipping methods. */
    "fx:shipping_methods": FxShippingMethods;
    /** Various predefined property values. */
    "fx:property_helpers": FxPropertyHelpers;
    /** List of available shipping services for this shipping method. */
    "fx:shipping_services": FxShippingServices;
    /** List of available shipping containers for this shipping method. */
    "fx:shipping_containers": FxShippingContainers;
    /** List of available shipping drop types for this shipping method. */
    "fx:shipping_drop_types": FxShippingDropTypes;
  };

  props: {
    /** The name of this shipping method */
    name: string;
    /** The code for this shipping method */
    code: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
