import type * as FxAttribute from "../integration/attribute";

export interface Graph {
  curie: FxAttribute.Graph["curie"];
  links: never;
  props: FxAttribute.Graph["props"];
}
