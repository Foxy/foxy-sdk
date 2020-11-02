import type { APIGraph } from '../../core/types';
import type { FxItem } from './item';
import type { FxItems as IntegrationAPIFxItems } from '../../integration/rels/items';

export interface FxItems extends APIGraph {
  curie: IntegrationAPIFxItems['curie'];
  child: FxItem;
}
