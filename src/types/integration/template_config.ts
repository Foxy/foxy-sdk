import type * as FxTemplateSets from "./template_sets";
import type * as FxStore from "./store";

type Curie = "fx:template_config";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Related store resource. */
  "fx:store": FxStore.Graph;
  /** List of template sets using this template config. */
  "fx:template_sets": FxTemplateSets.Graph;
}

interface Props {
  /** The description of your template config. */
  description: string;
  /** This is the template configuration settings for your store. */
  json: string;
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
