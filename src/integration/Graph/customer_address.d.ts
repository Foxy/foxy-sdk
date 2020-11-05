import type { FxCustomer } from './customer';
import type { FxStore } from './store';
import type { Graph } from '../../core';

export interface FxCustomerAddress extends Graph {
  curie: 'fx:customer_address';

  links: {
    /** This resource. */
    'self': FxCustomerAddress;
    /** Store the customer account belongs to. */
    'fx:store': FxStore;
    /** Customer this address is linked to. */
    'fx:customer': FxCustomer;
  };

  props: {
    /** By default, the country value must be valid according to the store's location_filtering value in the template_config. For instance, if your store is configured to only allow shipping and billing to the US, attempting to set the country to CA (Canada) will error. If true is passed in, the country can be any valid values. For customer_address resources that aren't the default shipping or billing, the validation will assume the shipping restrictions. NOTE: This does not currently take the region filtering into account. Defaults to false. */
    ignore_address_restrictions: boolean;
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
    is_default_billing: string;
    /** Specifies if this address is the default shipping address for the customer. */
    is_default_shipping: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
