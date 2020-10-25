import type * as IntegrationAPIFxItems from "../integration/items";
import type { FxItem } from "./item";

export interface FxItems {
  curie: IntegrationAPIFxItems.Graph["curie"];
  links: never;
  props: never;
  child: FxItem;
}
