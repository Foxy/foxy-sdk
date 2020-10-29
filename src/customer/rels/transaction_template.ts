import type { FxTransactionTemplate as IntegrationAPIFxTransactionTemplate } from '../../integration/rels/transaction_template';
import type { FxItems } from './items';

export interface FxTransactionTemplate {
  curie: IntegrationAPIFxTransactionTemplate['curie'];
  links: never;
  props: IntegrationAPIFxTransactionTemplate['props'];
  zooms: {
    items: FxItems;
  };
}
