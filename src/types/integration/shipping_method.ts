import type * as FxShippingContainers from "./shipping_containers";
import type * as FxShippingDropTypes from "./shipping_drop_types";
import type * as FxShippingServices from "./shipping_services";
import type * as FxShippingMethods from "./shipping_methods";
import type * as FxPropertyHelpers from "./property_helpers";

type Curie = "fx:shipping_method";

interface Links {
  /** This resource. */
  "self": Graph;
  /** List of all available shipping methods. */
  "fx:shipping_methods": FxShippingMethods.Graph;
  /** Various predefined property values. */
  "fx:property_helpers": FxPropertyHelpers.Graph;
  /** List of available shipping services for this shipping method. */
  "fx:shipping_services": FxShippingServices.Graph;
  /** List of available shipping containers for this shipping method. */
  "fx:shipping_containers": FxShippingContainers.Graph;
  /** List of available shipping drop types for this shipping method. */
  "fx:shipping_drop_types": FxShippingDropTypes.Graph;
}

interface Props {
  /** The name of this shipping method */
  name: string;
  /** The code for this shipping method */
  code: string;
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
