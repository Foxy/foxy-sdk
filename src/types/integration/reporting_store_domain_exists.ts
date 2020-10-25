import type * as FxReporting from "./reporting";
import type * as FxStore from "./store";

export type Rel = "reporting_store_domain_exists";
export type Curie = "fx:reporting_store_domain_exists";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Graph;
  /** Link to store for the requested domain. */
  "fx:store": FxStore.Graph;
  /** Reporting API home. */
  "fx:reporting": FxReporting.Graph;
}

export interface Props {
  /** A small, human readable explanation of this resource. */
  message: string;
}

export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
