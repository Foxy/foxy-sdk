import type { APIGraph } from '../../core/types';
import type { FxAttributes } from './attributes';
import type { FxCouponDetails } from './coupon_details';
import type { FxDiscountDetails } from './discount_details';
import type { FxItemCategory } from './item_category';
import type { FxItemOptions } from './item_options';
import type { FxShipment } from './shipment';
import type { FxStore } from './store';
import type { FxTransaction } from './transaction';

export interface FxItem extends APIGraph {
  curie: 'fx:item';

  links: {
    /** This resource. */
    'self': FxItem;
    /** Store this item belongs to. */
    'fx:store': FxStore;
    /** Related shipment info. */
    'fx:shipment': FxShipment;
    /** Custom attributes linked to this item. */
    'fx:attributes': FxAttributes;
    /** Related transaction info. */
    'fx:transaction': FxTransaction;
    /** Various custom options for this item. */
    'fx:item_options': FxItemOptions;
    /** Category this item belongs in. */
    'fx:item_category': FxItemCategory;
    /** Details about coupons linked to this item. */
    'fx:coupon_details': FxCouponDetails;
    /** Details about discounts linked to this item. */
    'fx:discount_details': FxDiscountDetails;
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
    discount_details?: FxDiscountDetails;
    coupon_details?: FxCouponDetails;
    item_category?: FxItemCategory;
    item_options?: FxItemOptions;
  };
}
