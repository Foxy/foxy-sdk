import type * as IntegrationAPIFxAttributes from "../integration/attributes";
import type { FxAttribute } from "./attribute";

export interface FxAttributes {
  curie: IntegrationAPIFxAttributes.Graph["curie"];
  links: never;
  props: never;
  child: FxAttribute;
}
