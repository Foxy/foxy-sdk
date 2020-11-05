import type * as Core from '../../core';
import type * as Integration from '../../integration';
import type { FxAttributes } from './attributes';
import type { FxDefaultBillingAddress } from './default_billing_address';
import type { FxDefaultPaymentMethod } from './default_payment_method';
import type { FxDefaultShippingAddress } from './default_shipping_address';
import type { FxSubscriptions } from './subscriptions';
import type { FxTransactions } from './transactions';

export interface Graph extends Core.Graph {
  props: Pick<
    Integration.Rels.FxCustomer['props'],
    | 'date_created'
    | 'date_modified'
    | 'email'
    | 'first_name'
    | 'id'
    | 'is_anonymous'
    | 'last_login_date'
    | 'last_name'
    | 'tax_id'
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
