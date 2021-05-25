import type { Attributes } from './attributes';
import type { CustomerAddresses } from './customer_addresses';
import type { DefaultBillingAddress } from './default_billing_address';
import type { DefaultPaymentMethod } from './default_payment_method';
import type { DefaultShippingAddress } from './default_shipping_address';
import type { Graph } from '../../core';
import type { SubModificationUrl } from './sub_modification_url';
import type { SubTokenUrl } from './sub_token_url';
import type { Subscriptions } from './subscriptions';
import type { Transactions } from './transactions';

interface Customer extends Graph {
  curie: 'fx:customer';

  links: {
    /** This resource. */
    'self': Customer;
    /** Attributes for this customer. */
    'fx:attributes': Attributes;
    /** List of customer's transactions. */
    'fx:transactions': Transactions;
    /** List of customer's subscriptions. */
    'fx:subscriptions': Subscriptions;
    /** List of customer's addresses. */
    'fx:customer_addresses': CustomerAddresses;
    /** Customer's default payment method. */
    'fx:default_payment_method': DefaultPaymentMethod;
    /** Customer's default billing address. */
    'fx:default_billing_address': DefaultBillingAddress;
    /** Customer's default shipping address. */
    'fx:default_shipping_address': DefaultShippingAddress;
    /** Navigate to this URL to open a cart with subscription details. */
    'fx:sub_token_url': SubTokenUrl;
    /** Navigate to this URL to make changes to this subscription. */
    'fx:sub_modification_url': SubModificationUrl;
  };

  props: {
    /** The FoxyCart customer id, useful for Single Sign On integrations. */
    id: number;
    /** The date of the last time this customer authenticated with the FoxyCart checkout. */
    last_login_date: string;
    /** The customer's given name. */
    first_name: string;
    /** The customer's surname. */
    last_name: string;
    /** The customer's email address. This is used as the login to the FoxyCart checkout for this customer. */
    email: string;
    /** A tax identification number for this customer. */
    tax_id: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  zooms: {
    default_shipping_address?: DefaultShippingAddress;
    default_billing_address?: DefaultBillingAddress;
    default_payment_method?: DefaultPaymentMethod;
    attributes: Attributes;
  };
}

export { Customer as Graph };
