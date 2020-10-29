import { FxAttribute as IntegrationAPIFxAttribute } from '../../integration/rels/attribute';

export interface FxAttribute {
  curie: IntegrationAPIFxAttribute['curie'];
  links: never;
  props: IntegrationAPIFxAttribute['props'];
}
