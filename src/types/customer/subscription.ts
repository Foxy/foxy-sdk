import type * as IntegrationAPIFxCustomerPortalSettings from "../integration/customer_portal_settings";
import type * as IntegrationAPIFxSubscription from "../integration/subscription";
import type { FxTransactionTemplate } from "./transaction_template";
import type { FxTransactions } from "./transactions";

export interface FxSubscription {
  curie: IntegrationAPIFxSubscription.Graph["curie"];
  links: Pick<IntegrationAPIFxSubscription.Graph["links"], "self" | "fx:sub_token_url">;
  props: IntegrationAPIFxSubscription.Graph["props"];
  zooms: {
    transaction_template: FxTransactionTemplate;
    transactions: FxTransactions;
    template_config: {
      curie: "template_config";
      links: never;
      props: IntegrationAPIFxCustomerPortalSettings.Graph["props"]["subscriptions"];
    };
  };
}
