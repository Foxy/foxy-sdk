import type { BillingAddresses } from './billing_addresses';
import type { Customer } from './customer';
import type { CustomerAddress } from './customer_address';
import type { Graph } from '../../core';
import type { Store } from './store';
import type { Transaction } from './transaction';

export interface BillingAddress extends Graph {
  curie: 'fx:billing_address';

  links: {
    /** This resource. */
    'self': BillingAddress;
    /** Store this billing address is registered in. */
    'fx:store': Store;
    /** Customer this billing address belongs to. */
    'fx:customer': Customer;
    /** Transaction associated with this billing address. */
    'fx:transaction': Transaction;
    /** Address of the customer this billing address belongs to. */
    'fx:customer_address': CustomerAddress;
    /** Collection of all billing addresses. */
    'fx:billing_addresses': BillingAddresses;
  };

  props: {
    /** The name of this address. This is also the value used as the shipto entry for a multiship item. */
    address_name: string;
    /** The given name associated with this address. */
    first_name: string;
    /** The surname associated with this address. */
    last_name: string;
    /** The company associated with this address. */
    company: string;
    /** The first line of the street address. */
    address1: string;
    /** The second line of the street address. */
    address2: string;
    /** The city of this address. */
    city: string;
    /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, use the full region name. */
    region: string;
    /** The postal code of this address. */
    postal_code: string;
    /** The country code of this address. */
    country: string;
    /** The phone of this address. */
    phone: string;
    /** Specifies if this address is the default billing address for the customer. */
    is_default_billing: boolean;
    /** Specifies if this address is the default shipping address for the customer. */
    is_default_shipping: boolean;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
