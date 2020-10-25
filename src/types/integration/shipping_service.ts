import type * as FxShippingMethods from "./shipping_methods";
import type * as FxPropertyHelpers from "./property_helpers";
import type * as FxShippingMethod from "./shipping_method";

type Curie = "fx:shipping_service";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Shipping method associated with this shipping service. */
  "fx:shipping_method": FxShippingMethod.Graph;
  /** List of all available shipping methods. */
  "fx:shipping_methods": FxShippingMethods.Graph;
  /** Various predefined property values. */
  "fx:property_helpers": FxPropertyHelpers.Graph;
}

interface Props {
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
}

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
