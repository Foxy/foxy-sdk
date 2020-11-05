import type * as Core from '../../core';
import type * as Integration from '../../integration';
import type { FxTransactionTemplate } from './transaction_template';
import type { FxTransactions } from './transactions';

export interface FxSubscription extends Core.Graph {
  curie: Integration.Rels.FxSubscription['curie'];
  links: Pick<Integration.Rels.FxSubscription['links'], 'self' | 'fx:sub_token_url'>;
  props: Integration.Rels.FxSubscription['props'];
  zooms: {
    transaction_template: FxTransactionTemplate;
    transactions: FxTransactions;
    template_config: {
      curie: 'template_config';
      props: Integration.Rels.FxCustomerPortalSettings['props']['subscriptions'];
    };
  };
}
