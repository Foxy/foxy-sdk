import { FxAttribute as IntegrationAPIFxAttribute } from "../integration/attribute";

export interface FxAttribute {
  curie: IntegrationAPIFxAttribute["curie"];
  links: never;
  props: IntegrationAPIFxAttribute["props"];
}
