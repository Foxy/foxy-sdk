import type { FxPropertyHelpers } from "./property_helpers";

export interface FxShippingAddressTypes {
  curie: "fx:shipping_address_types";

  links: {
    /** This resource. */
    "self": FxShippingAddressTypes;
    /** Various predefined property values. */
    "fx:property_helpers": FxPropertyHelpers;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the checkout types supported. The key values are the values you use for the Store resource's `shipping_address_type` property. */
    values: Record<string, string>;
  };
}
