import type * as FxCustomerPortalSettings from "../integration/customer_portal_settings";
import type * as FxTransactionTemplate from "./transaction_template";
import type * as FxSubscription from "../integration/subscription";
import type * as FxTransactions from "./transactions";

export interface Graph {
  curie: FxSubscription.Graph["curie"];
  links: Pick<FxSubscription.Graph["links"], "self" | "fx:sub_token_url">;
  props: FxSubscription.Graph["props"];
  zooms: {
    transaction_template: FxTransactionTemplate.Graph;
    transactions: FxTransactions.Graph;
    template_config: {
      curie: "template_config";
      links: never;
      props: FxCustomerPortalSettings.Graph["props"]["subscriptions"];
    };
  };
}
