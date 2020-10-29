import type { FxItem as IntegrationAPIFxItem } from '../../integration/rels/item';

export interface FxItem {
  curie: IntegrationAPIFxItem['curie'];
  links: never;
  props: IntegrationAPIFxItem['props'];
}
