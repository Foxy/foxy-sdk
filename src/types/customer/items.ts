import type { FxItems as IntegrationAPIFxItems } from "../integration/items";
import type { FxItem } from "./item";

export interface FxItems {
  curie: IntegrationAPIFxItems["curie"];
  links: never;
  props: never;
  child: FxItem;
}
