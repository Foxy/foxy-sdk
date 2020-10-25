import type * as IntegrationAPIFxItem from "../integration/item";

export interface FxItem {
  curie: IntegrationAPIFxItem.Graph["curie"];
  links: never;
  props: IntegrationAPIFxItem.Graph["props"];
}
