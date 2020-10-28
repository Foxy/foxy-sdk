import type { FxStore } from "./store";

export interface FxDefaultStore {
  curie: "fx:default_store";
  links: FxStore["links"];
  props: FxStore["props"];
}
