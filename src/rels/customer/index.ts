import type { FxCustomer as IntegrationAPIFxCustomer } from "../integration/customer";
import type { FxDefaultShippingAddress } from "./default_shipping_address";
import type { FxDefaultBillingAddress } from "./default_billing_address";
import type { FxDefaultPaymentMethod } from "./default_payment_method";
import type { FxSubscriptions } from "./subscriptions";
import type { FxTransactions } from "./transactions";
import type { FxAttributes } from "./attributes";

export interface CustomerAPIGraph {
  curie: never;
  links: never;
  props: Pick<
    IntegrationAPIFxCustomer["props"],
    | "date_created"
    | "date_modified"
    | "email"
    | "first_name"
    | "id"
    | "is_anonymous"
    | "last_login_date"
    | "last_name"
    | "tax_id"
  >;
  zooms: {
    default_shipping_address?: FxDefaultShippingAddress;
    default_billing_address?: FxDefaultBillingAddress;
    default_payment_method?: FxDefaultPaymentMethod;
    subscriptions?: FxSubscriptions;
    transactions?: FxTransactions;
    attributes: FxAttributes;
  };
}
