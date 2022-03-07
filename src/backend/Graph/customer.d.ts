import type { Attributes } from './attributes';
import type { CustomerAddresses } from './customer_addresses';
import type { DefaultBillingAddress } from './default_billing_address';
import type { DefaultPaymentMethod } from './default_payment_method';
import type { DefaultShippingAddress } from './default_shipping_address';
import type { Graph } from '../../core';
import type { Store } from './store';
import type { Subscriptions } from './subscriptions';
import type { Transactions } from './transactions';

export interface Customer extends Graph {
  curie: 'fx:customer';

  links: {
    /** This resource. */
    'self': Customer;
    /** Store this customer is registered in. */
    'fx:store': Store;
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
    /** Your customer's clear text password. This value is never stored, not displayed for this resource, and is not available in our system. You can, however, pass it via clear text when creating or modifying a customer. When creating a customer, if you leave this blank, a random value will be generated for you which you can modify later as needed. */
    password: string;
    /** The salt for this customer's login password. If your integration syncs passwords, you will need to keep this value in sync as well. */
    password_salt: string;
    /** The hash of this customer's login password. If your integration syncs passwords, you will need to keep this value in sync as well. */
    password_hash: string;
    /** This will be a copy of your store's current password_hash_type at the time of creation or modificaiton. This way, if you change your store's settings, your customer will still be able to login. It will be updated automatically to match that of the store the next time the customer logs in. */
    password_hash_type: string;
    /** This will be a copy of your store's current password_hash_config at the time of creation or modification. This way, if you change your store's settings, your customer will still be able to login. It will be updated automatically to match that of the store the next time the customer logs in. */
    password_hash_config: string;
    /** If your customer forgot their password and requested a forgotten password, it will be set here. */
    forgot_password: string;
    /** The exact time the forgot password was set. */
    forgot_password_timestamp: string;
    /** If this customer checks out as a guest, this will be set to true. Once it is set, it can not be changed. */
    is_anonymous: boolean;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };

  zooms: {
    default_shipping_address?: DefaultShippingAddress;
    default_billing_address?: DefaultBillingAddress;
    default_payment_method?: DefaultPaymentMethod;
    customer_addresses?: CustomerAddresses;
    attributes: Attributes;
  };
}
