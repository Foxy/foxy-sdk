import type * as FxShippingServices from "./shipping_services";
import type * as FxShippingMethods from "./shipping_methods";
import type * as FxShippingService from "./shipping_service";
import type * as FxShippingMethod from "./shipping_method";
import type * as FxStore from "./store";

export type Rel = "store_shipping_service";
export type Curie = "fx:store_shipping_service";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Related store resource. */
  "fx:store": FxStore.Links;
  /** Shipping method linked to this shipping service. */
  "fx:shipping_method": FxShippingMethod.Links;
  /** Related shipping service. */
  "fx:shipping_service": FxShippingService.Links;
  /** List of all available shipping methods. */
  "fx:shipping_methods": FxShippingMethods.Links;
  /** List of all available shipping services for this shipping method. */
  "fx:shipping_services": FxShippingServices.Links;
}

export interface Props {
  /** The full API URI of the shipping method defined in our property helpers. */
  shipping_method_uri: string;
  /** The full API URI of the shipping method shipping service defined in our property helpers. Each shipping method will have it's own shipping services. */
  shipping_service_uri: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
