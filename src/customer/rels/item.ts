import type { APIGraph } from '../../core/types';
import type { FxItem as IntegrationAPIFxItem } from '../../integration/rels/item';

export interface FxItem extends APIGraph {
  curie: IntegrationAPIFxItem['curie'];
  props: IntegrationAPIFxItem['props'];
}
