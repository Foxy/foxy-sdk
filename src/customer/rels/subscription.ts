import type { FxCustomerPortalSettings as IntegrationAPIFxCustomerPortalSettings } from '../../integration/rels/customer_portal_settings';
import type { FxSubscription as IntegrationAPIFxSubscription } from '../../integration/rels/subscription';
import type { FxTransactionTemplate } from './transaction_template';
import type { FxTransactions } from './transactions';

export interface FxSubscription {
  curie: IntegrationAPIFxSubscription['curie'];
  links: Pick<IntegrationAPIFxSubscription['links'], 'self' | 'fx:sub_token_url'>;
  props: IntegrationAPIFxSubscription['props'];
  zooms: {
    transaction_template: FxTransactionTemplate;
    transactions: FxTransactions;
    template_config: {
      curie: 'template_config';
      links: never;
      props: IntegrationAPIFxCustomerPortalSettings['props']['subscriptions'];
    };
  };
}
