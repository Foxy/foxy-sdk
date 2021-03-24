import type { Customer } from './customer';
import type { CustomerAddress } from './customer_address';
import type { Graph } from '../../core';
import type { Items } from './items';
import type { Shipments } from './shipments';
import type { Store } from './store';
import type { Transaction } from './transaction';

export interface Shipment extends Graph {
  curie: 'fx:shipment';

  links: {
    /** This resource. */
    'self': Shipment;
    /** Related store resource. */
    'fx:store': Store;
    /** Items in this shipment. */
    'fx:items': Items;
    /** Customer who this shipment is intented for. */
    'fx:customer': Customer;
    /** List of all shipments in the transaction. */
    'fx:shipments': Shipments;
    /** Related transaction resource. */
    'fx:transaction': Transaction;
    /** Customer's address. */
    'fx:customer_address': CustomerAddress;
  };

  props: {
    /** Either the shipto value or `Default Shipping Address` for non-multiship transactions. */
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
    /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, the full region name will be used. */
    region: string;
    /** The postal code of this address. */
    postal_code: string;
    /** The country code of this address. */
    country: string;
    /** The phone of this address. */
    phone: string;
    /** The shipping service id selected during checkout. This will normally correspond with a `shipping_service` from one of the {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/shipment/shipping_methods shipping_methods} available. */
    shipping_service_id: number;
    /** The description of the shipping service selected for this shipment. */
    shipping_service_description: string;
    /** The total price of the items in this shipment. */
    total_item_price: number;
    /** The total tax on the items in this shipment. */
    total_tax: number;
    /** The total shipping cost of the items in this shipment. */
    total_shipping: number;
    /** The total price of this shipment. */
    total_price: number;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
