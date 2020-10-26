import type { FxEmailTemplate } from "./email_template";
import type { FxTemplateSets } from "./template_sets";
import type { FxStore } from "./store";
import type { FxCache } from "./cache";

export interface FxCustomerEmailTemplate {
  curie: "fx:customer_email_template";

  links: {
    /** This resource. */
    "self": FxCustomerEmailTemplate;
    /** Store this template belongs to. */
    "fx:store": FxStore;
    /** POST here to cache your template using the `content_html_url` and `content_text_url`. */
    "fx:cache": FxCache;
    /** Template sets using this template. */
    "fx:template_sets": FxTemplateSets;
  };

  props: FxEmailTemplate["props"];
}
