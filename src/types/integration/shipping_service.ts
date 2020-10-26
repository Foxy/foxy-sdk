import type { FxShippingMethods } from "./shipping_methods";
import type { FxPropertyHelpers } from "./property_helpers";
import type { FxShippingMethod } from "./shipping_method";

export interface FxShippingService {
  curie: "fx:shipping_service";

  links: {
    /** This resource. */
    "self": FxShippingService;
    /** Shipping method associated with this shipping service. */
    "fx:shipping_method": FxShippingMethod;
    /** List of all available shipping methods. */
    "fx:shipping_methods": FxShippingMethods;
    /** Various predefined property values. */
    "fx:property_helpers": FxPropertyHelpers;
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
