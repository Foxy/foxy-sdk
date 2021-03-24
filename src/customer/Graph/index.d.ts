import type * as Backend from '../../backend';
import type * as Core from '../../core';
import type { Attributes } from './attributes';
import type { DefaultBillingAddress } from './default_billing_address';
import type { DefaultPaymentMethod } from './default_payment_method';
import type { DefaultShippingAddress } from './default_shipping_address';
import type { Subscriptions } from './subscriptions';
import type { Transactions } from './transactions';

export interface Graph extends Core.Graph {
  props: Pick<
    Backend.Rels.Customer['props'],
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
    default_shipping_address?: DefaultShippingAddress;
    default_billing_address?: DefaultBillingAddress;
    default_payment_method?: DefaultPaymentMethod;
    subscriptions?: Subscriptions;
    transactions?: Transactions;
    attributes: Attributes;
  };
}
