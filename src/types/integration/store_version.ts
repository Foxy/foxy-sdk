import type * as FxPropertyHelpers from "./property_helpers";
import type * as FxStoreVersions from "./store_versions";

type Curie = "fx:store_version";

interface Links {
  /** This resource. */
  "self": Graph;
  /** List of all available store versions. */
  "fx:store_versions": FxStoreVersions.Graph;
  /** Various predefined property values. */
  "fx:property_helpers": FxPropertyHelpers.Graph;
}

interface Props {
  /** Human readable store version string. */
  version: string;
  /** The full URL of the blog post describing the new release. */
  changelog_blog_url: string;
  /** The full URL of the changelog. */
  changelog_url: string;
  /** Full content of the changelog as HTML */
  changelog_content: string;
  /** A JSON object for various cart types supported by this version. Examples include colorbox with links to the JavaScript library, FoxyCart JavaScript files, and FoxyCart CSS files. */
  cart_types: string;
  /** The date this version was publicly released. */
  version_date: string;
  /** If this version is currently visible in the FoxyCart admin. At times, FoxyCart may launch a private beta of the latest version. */
  is_visible: boolean;
  /** If this version is currently considered a beta release. */
  is_beta: boolean;
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
