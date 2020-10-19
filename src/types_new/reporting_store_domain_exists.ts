import type * as FxReporting from "./reporting";
import type * as FxStore from "./store";

export type Rel = "reporting_store_domain_exists";
export type Curie = "fx:reporting_store_domain_exists";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Link to store for the requested domain. */
  "fx:store": FxStore.Links;
  /** Reporting API home. */
  "fx:reporting": FxReporting.Links;
}

export interface Props {
  /** A small, human readable explanation of this resource. */
  message: string;
}

export type Zoom = never;
