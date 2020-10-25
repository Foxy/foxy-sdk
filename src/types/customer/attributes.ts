import type * as FxAttributes from "../integration/attributes";
import type * as FxAttribute from "./attribute";

export interface Graph {
  curie: FxAttributes.Graph["curie"];
  links: never;
  props: never;
  child: FxAttribute.Graph;
}
