import type * as FxStore from "./store";

export type Rel = "native_integration";
export type Curie = "fx:native_integration";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Store this native integration is enabled on. */
  "fx:store": FxStore.Links;
}

export interface Props {
  /** The identifier string of this provider. */
  provider: string;
  /** A JSON string containing the configuration values and credentials for this native integration. */
  config: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zoom = never;
