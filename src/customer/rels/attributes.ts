import type { FxAttributes as IntegrationAPIFxAttributes } from "../../integration/rels/attributes";
import type { FxAttribute } from "./attribute";

export interface FxAttributes {
  curie: IntegrationAPIFxAttributes["curie"];
  links: never;
  props: never;
  child: FxAttribute;
}
