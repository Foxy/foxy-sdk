import type { APIGraph } from '../../core/types';
import type { FxEmailTemplates } from './email_templates';
import type { FxStore } from './store';
import type { FxTaxItemCategories } from './tax_item_categories';

export interface FxItemCategory extends APIGraph {
  curie: 'fx:item_category';

  links: {
    /** This resource. */
    'self': FxItemCategory;
    /** Store this category is registered in. */
    'fx:store': FxStore;
    /** Email templates for the store. */
    'fx:email_templates': FxEmailTemplates;
    /** Related tax item categories. */
    'fx:tax_item_categories': FxTaxItemCategories;
  };

  props: {
    /** The full API URI of the email template used by this category for sending an administrative email if send_admin_email is true. */
    admin_email_template_uri: string;
    /** The full API URI of the email template used by this category for sending an additional customer email if send_customer_email is true. */
    customer_email_template_uri: string;
    /** The category code used when applying this item category to the cart. */
    code: string;
    /** The name of this category. */
    name: string;
    /** The delivery type of the items in this category. */
    item_delivery_type: string;
    /** Determines how many times the same customer can attempt to download a purchased downloadable item before they are given an error. */
    max_downloads_per_customer: number;
    /** Determines how long in hours after the initial purchase a customer can attempt to download a purchased downloadable item before they are given an error. Some helpful values include: 1 day = 24 hours, 1 Week = 168 hours, 1 Month = 672 hours, 6 Months = 4032 hours */
    max_downloads_time_period: number;
    /** The customs value that should be used for shipping services for items in this category. */
    customs_value: number;
    /** The default weight of an item in this category if no individual item weight is given. */
    default_weight: number;
    /** The weight unit of measurement that will be sent to shipping services for items in this category. */
    default_weight_unit: 'LBS' | 'KGS';
    /** The length unit of measurement that will be sent to shipping services for items in this category. */
    default_length_unit: 'IN' | 'CM';
    /** The amount to charge for flat rate shipping when the `item_delivery_type` is `flat_rate`. */
    shipping_flat_rate: number;
    /** How to apply the flat rate shipping amount, either to the whole order or to each shipment in the order. */
    shipping_flat_rate_type: string;
    /** Specify a handling fee type if you want items in this category to have a handling fee added to their price. */
    handling_fee_type: 'none' | 'flat_per_order' | 'flat_per_item' | 'flat_percent' | 'flat_percent_with_minimum';
    /** The handling fee amount for this category. */
    handling_fee: number;
    /** The minimum fee when calculating the flat fee per shipment OR % of order total with items in this category. Whichever is greater. */
    handling_fee_minimum: number;
    /** The handling fee percentage used when the `handling_fee_type` includes a percentage. */
    handling_fee_percentage: number;
    /** If specified, the type of discount applied to this item category. */
    discount_type: '' | 'quantity_amount' | 'quantity_percentage' | 'price_amount' | 'price_percentage';
    /** The name of this category discount. */
    discount_name: string;
    /** This is the string that determines the tiers and amounts that make up your discount. For example, 2-.50|10-3|50-5 means "between 2 and 9 is discounted by .5 per product, 10 and 49 by 3 per product and 50 and over by 5 per product. If you're doing a quantity discount, it will compare against the quantity of products in the order. If you're doing a price based discount, it will compare against the price of the products in the order. Please see the documentation for more information: {@link http://wiki.foxycart.com/v/2.0/coupons_and_discounts Coupons and Discounts} */
    discount_details: string;
    /** Set to true to send an email to the customer any time an item in this category is purchased. If you set this to true, you'll also need to specify a `customer_email_template_uri` */
    send_customer_email: boolean;
    /** Set to true to send an email to an administrator any time an item in this category is purchased. If you set this to true, you'll also need to specify a `admin_email_template_uri` */
    send_admin_email: boolean;
    /** Email address of the administrator you'd like to send an email to every time an item in this category is purchased. */
    admin_email: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
