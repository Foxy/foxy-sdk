import type * as FxNativeIntegrations from "./native_integrations";
import type * as FxTaxItemCategories from "./tax_item_categories";
import type * as FxStore from "./store";

export type Rel = "tax";
export type Curie = "fx:tax";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Graph;
  /** Related store resource. */
  "fx:store": FxStore.Graph;
  /** List of tax item category relationships. */
  "fx:tax_item_categories": FxTaxItemCategories.Graph;
  /** List of native integrations for this service provider. */
  "fx:native_integrations": FxNativeIntegrations.Graph;
}

export interface Props {
  /** The name of this tax which will be displayed to the customer. */
  name: string;
  /** The type of tax rate which determines when this tax will be applied. */
  type: "global" | "country" | "region" | "local";
  /** The country which will be matched against the customer shipping country to determine if a country tax will be applied. */
  country: string;
  /** The region (also known as a state or province) which will be matched against the customer shipping region to determine if a regional tax will be applied. */
  region: string;
  /** The city which will be matched against the customer shipping city to determine if a local tax will be applied. */
  city: string;
  /** Set to true if the tax rate will be determined automatically by the postal code. */
  is_live: boolean;
  /** If using a live tax rate service provider, this value can be set to determine which provider you would like to use. */
  service_provider: "avalara" | "";
  /** Set to true if the tax rate will also be applied to the shipping costs. */
  apply_to_shipping: boolean;
  /** For a Union tax type, set to true to use the origin country tax rates. */
  use_origin_rates: boolean;
  /** Set to true to exempt all customers with a tax id */
  exempt_all_customer_tax_ids: boolean;
  /** The tax rate to be applied for this tax. For 10%, use 10. */
  rate: number;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
