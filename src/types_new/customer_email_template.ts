import type * as FxEmailTemplate from "./email_template";
import type * as FxTemplateSets from "./template_sets";
import type * as FxStore from "./store";
import type * as FxCache from "./cache";

export type Rel = "customer_email_template";
export type Curie = "fx:customer_email_template";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Links;
  /** Store this template belongs to. */
  "fx:store": FxStore.Links;
  /** POST here to cache your template using the `content_html_url` and `content_text_url`. */
  "fx:cache": FxCache.Links;
  /** Template sets using this template. */
  "fx:template_sets": FxTemplateSets.Links;
}

export type Props = FxEmailTemplate.Props;
export type Zoom = never;
