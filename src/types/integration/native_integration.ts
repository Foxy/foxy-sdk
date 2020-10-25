import type * as FxStore from "./store";

type Curie = "fx:native_integration";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Store this native integration is enabled on. */
  "fx:store": FxStore.Graph;
}

interface Props {
  /** The identifier string of this provider. */
  provider: string;
  /** A JSON string containing the configuration values and credentials for this native integration. */
  config: string;
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
