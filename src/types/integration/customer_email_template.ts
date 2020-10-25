import type * as FxEmailTemplate from "./email_template";
import type * as FxTemplateSets from "./template_sets";
import type * as FxStore from "./store";
import type * as FxCache from "./cache";

export type Rel = "customer_email_template";
export type Curie = "fx:customer_email_template";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Graph;
  /** Store this template belongs to. */
  "fx:store": FxStore.Graph;
  /** POST here to cache your template using the `content_html_url` and `content_text_url`. */
  "fx:cache": FxCache.Graph;
  /** Template sets using this template. */
  "fx:template_sets": FxTemplateSets.Graph;
}

export type Props = FxEmailTemplate.Props;
export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
