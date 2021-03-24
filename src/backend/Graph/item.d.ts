import type { Attributes } from './attributes';
import type { CouponDetails } from './coupon_details';
import type { DiscountDetails } from './discount_details';
import type { Graph } from '../../core';
import type { ItemCategory } from './item_category';
import type { ItemOptions } from './item_options';
import type { Shipment } from './shipment';
import type { Store } from './store';
import type { Transaction } from './transaction';

export interface Item extends Graph {
  curie: 'fx:item';

  links: {
    /** This resource. */
    'self': Item;
    /** Store this item belongs to. */
    'fx:store': Store;
    /** Related shipment info. */
    'fx:shipment': Shipment;
    /** Custom attributes linked to this item. */
    'fx:attributes': Attributes;
    /** Related transaction info. */
    'fx:transaction': Transaction;
    /** Various custom options for this item. */
    'fx:item_options': ItemOptions;
    /** Category this item belongs in. */
    'fx:item_category': ItemCategory;
    /** Details about coupons linked to this item. */
    'fx:coupon_details': CouponDetails;
    /** Details about discounts linked to this item. */
    'fx:discount_details': DiscountDetails;
  };

  props: {
    /** The full API URI of the item category associated with this item. */
    item_category_uri: string;
    /** The name of this item. */
    name: string;
    /** The price of this item. This represents the base price of the item before any item option modifiers. */
    price: number;
    /** The number of items in the cart or transaction. When adding products to the cart, if all properties are identical, the quantity will be incremented accordingly. */
    quantity: number;
    /** Minimum quantity that should be allowed per product, per cart. If the quantity is less than this, the quantity will be updated automatically to this number. */
    quantity_min: number;
    /** Maximum quantity that should be allowed per product, per cart. If the quantity is more than this, the quantity will be updated automatically to this amount. */
    quantity_max: number;
    /** This item's per-item weight, used for shipping rate requests. */
    weight: number;
    /** Item code. Can be used however you would like (internal use, product SKU, etc.). */
    code: string;
    /** Parent item code. Used if this should be a child product in a bundle. */
    parent_code: string;
    /** The name of the line item discount if it is included on this item. */
    discount_name: string;
    /** The type of the line item discount if this item has a discount. */
    discount_type: '' | 'quantity_amount' | 'quantity_percentage' | 'price_amount' | 'price_percentage';
    /** The details of the line item discount if this item has a discount. See the cart documentation for details on how this value should be formatted. */
    discount_details: string;
    /** This determines how often this subscription will be processed. The format is a number followed by a date type such as d (day), w (week), m (month), or y (year). You can also use .5m for twice a month. To modify this value for an existing subscription, you must modify the subscription directly. */
    subscription_frequency: string;
    /** The original date this subscription began or will begin if set in the future. To modify this value for an existing subscription, you must modify the subscription directly. */
    subscription_start_date: string;
    /** The date for when this subscription will run again. To modify this value for an existing subscription, you must modify the subscription directly. */
    subscription_next_transaction_date: string;
    /** If set, the date this subscription will end. The subscription will not run on this day. */
    subscription_end_date: string;
    /** If this item is part of a future subscription (or a subscription originally set up to start in the future), this will be set to true. */
    is_future_line_item: boolean;
    /** Used for multiship to assign this item to a specific shipment. This value will be the address name of the shipment. */
    shipto: string;
    /** The full item url for the customer to view this item online. */
    url: string;
    /** The full image url for the customer to view an image of this item online. */
    image: string;
    /** The length of this item. This is currently a place holder for future use. */
    length: number;
    /** The width of this item. This is currently a place holder for future use. */
    width: number;
    /** The width of this item. This is currently a place holder for future use. */
    height: number;
    /** As a unix timestamp, this is the point in the future when this item will no longer be valid and will be removed from the cart. */
    expires: number;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  zooms: {
    discount_details?: DiscountDetails;
    coupon_details?: CouponDetails;
    item_category?: ItemCategory;
    item_options?: ItemOptions;
  };
}
