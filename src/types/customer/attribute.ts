import type * as IntegrationAPIFxAttribute from "../integration/attribute";

export interface FxAttribute {
  curie: IntegrationAPIFxAttribute.Graph["curie"];
  links: never;
  props: IntegrationAPIFxAttribute.Graph["props"];
}
