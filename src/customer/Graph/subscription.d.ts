import type * as Backend from '../../backend';
import type * as Core from '../../core';
import type { TransactionTemplate } from './transaction_template';
import type { Transactions } from './transactions';

export interface Subscription extends Core.Graph {
  curie: Backend.Rels.Subscription['curie'];
  links: Pick<Backend.Rels.Subscription['links'], 'self' | 'fx:sub_token_url'>;
  props: Backend.Rels.Subscription['props'];
  zooms: {
    transaction_template: TransactionTemplate;
    transactions: Transactions;
    template_config: {
      curie: 'template_config';
      props: Backend.Rels.CustomerPortalSettings['props']['subscriptions'];
    };
  };
}
