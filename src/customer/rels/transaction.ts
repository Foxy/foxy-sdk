import type { APIGraph } from '../../core/types';
import type { FxItems } from './items';
import type { FxTransaction as IntegrationAPIFxTransaction } from '../../integration/rels/transaction';

export interface FxTransaction extends APIGraph {
  curie: IntegrationAPIFxTransaction['curie'];
  links: Pick<IntegrationAPIFxTransaction['links'], 'fx:receipt'>;
  props: IntegrationAPIFxTransaction['props'];
  zooms: { items?: FxItems };
}
