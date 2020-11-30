import type * as Core from '../../core';
import type * as Integration from '../../integration';
import type { TransactionTemplate } from './transaction_template';
import type { Transactions } from './transactions';

export interface Subscription extends Core.Graph {
  curie: Integration.Rels.Subscription['curie'];
  links: Pick<Integration.Rels.Subscription['links'], 'self' | 'fx:sub_token_url'>;
  props: Integration.Rels.Subscription['props'];
  zooms: {
    transaction_template: TransactionTemplate;
    transactions: Transactions;
    template_config: {
      curie: 'template_config';
      props: Integration.Rels.CustomerPortalSettings['props']['subscriptions'];
    };
  };
}
