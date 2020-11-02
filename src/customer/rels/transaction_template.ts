import type { APIGraph } from '../../core/types';
import type { FxItems } from './items';
import type { FxTransactionTemplate as IntegrationAPIFxTransactionTemplate } from '../../integration/rels/transaction_template';

export interface FxTransactionTemplate extends APIGraph {
  curie: IntegrationAPIFxTransactionTemplate['curie'];
  props: IntegrationAPIFxTransactionTemplate['props'];
  zooms: {
    items: FxItems;
  };
}
