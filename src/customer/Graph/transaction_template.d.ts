import type { Graph as Customer } from './index';
import type { Graph } from '../../core';
import type { Items } from './items';

export interface TransactionTemplate extends Graph {
  curie: 'fx:transaction_template';

  links: {
    /** This resource. */
    'self': TransactionTemplate;
    /** Items in this cart. */
    'fx:items': Items;
    /** Customer who created this cart. */
    'fx:customer': Customer;
  };

  props: {
    /** This value determines how an attached customer's addresses should be handled in the event the cart resource is POSTed to. When `false`, the customer's billing address will be used for both the billing and shipping addresses. Defaults to `true`, so a customer's shipping address will be used if it exists. */
    use_customer_shipping_address: boolean;
    /** The name of the billing address. This is also the value used as the shipto entry for a multiship item. */
    billing_address_name: string;
    /** The given name associated with the billing address. */
    billing_first_name: string;
    /** The surname associated with the billing address. */
    billing_last_name: string;
    /** The company associated with the billing address. */
    billing_company: string;
    /** The first line of billing street address. */
    billing_address1: string;
    /** The second line of the billing street address. */
    billing_address2: string;
    /** The city of this address. */
    billing_city: string;
    /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, use the full region name. */
    billing_state: string;
    /** The postal code of the billing address. */
    billing_postal_code: string;
    /** The country code of the billing address. */
    billing_country: string;
    /** The phone of the billing address. */
    billing_phone: string;
    /** The name of the shipping address. This is also the value used as the shipto entry for a multiship item. */
    shipping_address_name: string;
    /** The given name associated with the shipping address. */
    shipping_first_name: string;
    /** The surname associated with the shipping address. */
    shipping_last_name: string;
    /** The company associated with the shipping address. */
    shipping_company: string;
    /** The first line of shipping street address. */
    shipping_address1: string;
    /** The second line of the shipping street address. */
    shipping_address2: string;
    /** The city of this address. */
    shipping_city: string;
    /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, use the full region name. */
    shipping_state: string;
    /** The postal code of the shipping address. */
    shipping_postal_code: string;
    /** The country code of the shipping address. */
    shipping_country: string;
    /** The phone of the shipping address. */
    shipping_phone: string;
    /** The full API URI of the template set for this cart, if one has been specified. */
    template_set_uri: string;
    /** The language defined by the template set being used. */
    language: string;
    /** Total amount of the items in this cart. */
    total_item_price: string;
    /** Total amount of the taxes for this cart. */
    total_tax: string;
    /** Total amount of the shipping costs for this cart. */
    total_shipping: string;
    /** If this cart has any shippable subscription items which will process in the future, this will be the total amount of shipping costs for those items. */
    total_future_shipping: string;
    /** Total order amount of this cart including all items, taxes, shipping costs and discounts. */
    total_order: number;
    /** The 3 character ISO code for the currency. */
    currency_code: string;
    /** The currency symbol, such as $, £, €, etc. */
    currency_symbol: string;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };

  zooms: {
    customer?: Customer;
    items?: Items;
  };
}
