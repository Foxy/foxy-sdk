import type * as FxDefaultShippingAddress from "./default_shipping_address";
import type * as FxDefaultBillingAddress from "./default_billing_address";
import type * as FxDefaultPaymentMethod from "./default_payment_method";
import type * as FxSubscriptions from "./subscriptions";
import type * as FxTransactions from "./transactions";
import type * as FxAttributes from "./attributes";
import type * as FxCustomer from "../integration/customer";

export interface Graph {
  curie: never;
  links: never;
  props: Pick<
    FxCustomer.Graph["props"],
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
    default_shipping_address?: FxDefaultShippingAddress.Graph;
    default_billing_address?: FxDefaultBillingAddress.Graph;
    default_payment_method?: FxDefaultPaymentMethod.Graph;
    subscriptions?: FxSubscriptions.Graph;
    transactions?: FxTransactions.Graph;
    attributes: FxAttributes.Graph;
  };
}
