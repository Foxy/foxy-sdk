import type * as FxReporting from "./reporting";
import type * as FxStore from "./store";

type Curie = "fx:reporting_store_domain_exists";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Link to store for the requested domain. */
  "fx:store": FxStore.Graph;
  /** Reporting API home. */
  "fx:reporting": FxReporting.Graph;
}

interface Props {
  /** A small, human readable explanation of this resource. */
  message: string;
}

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
