import type { APIGraph } from '../../core/types';
import type { FxCouponCodes } from './coupon_codes';
import type { FxCouponItemCategories } from './coupon_item_categories';
import type { FxGenerateCodes } from './generate_codes';
import type { FxStore } from './store';

export interface FxCoupon extends APIGraph {
  curie: 'fx:coupon';

  links: {
    /** This resource. */
    'self': FxCoupon;
    /** Store this coupon belongs to. */
    'fx:store': FxStore;
    /** Codes linked to this coupon. */
    'fx:coupon_codes': FxCouponCodes;
    /** POST here to generate random coupon codes. */
    'fx:generate_codes': FxGenerateCodes;
    /** Valid item categories for this coupon. */
    'fx:coupon_item_categories': FxCouponItemCategories;
  };

  props: {
    /** The name of this coupon. This will be for your own use and displayed to the customer. */
    name: string;
    /** If you want this coupon's usage to be limited by a time frame or start in the future, add a start date here. To clear it out, set an empty value or use 0000-00-00. */
    start_date: string;
    /** If you want this coupon's usage to be limited by a time frame or end in the future, add an end date here. To clear it out, set an empty value or use 0000-00-00. */
    end_date: string;
    /** This is the total number of times this coupon is allowed to be used. This can be helpful for promotions that involve offering a discount to the first 100 customers, as an example, even though more than 100 coupon codes were given out. Leave as 0 to ignore this feature. */
    number_of_uses_allowed: number;
    /** For informational purposes, this shows you how many times this coupon has already been used. */
    number_of_uses_to_date: number;
    /** If each customer is only allowed to use this coupon once, enter 1 here. This is based off of the customer email address, not a payment method, ip address, shipping address or browser cookie. Leave as 0 to ignore this feature. */
    number_of_uses_allowed_per_customer: number;
    /** If you want to limit the number of uses per individual coupon code, enter that number here. If you want each code to only be used once, enter 1 here. Leave as 0 to ignore this feature. */
    number_of_uses_allowed_per_code: number;
    /** If you want to limit which products can use this coupon, you can enter a comma separated listed of product codes or partial product codes using * as a wild card at the beginning or end of the value. So abc123, fun_*, *-small would match abc123, fun_ and fun_times, and example-small. It wouldn't match abc12, abc1234, fun, or good-smalls. */
    product_code_restrictions: string;
    /** This specifies what type of discount will be applied. Will it be a percentage discount or an amount discount based on either the product price or the product quantity? */
    coupon_discount_type: 'quantity_amount' | 'quantity_percentage' | 'price_amount' | 'price_percentage';
    /** This is the string that determines the tiers and amounts that make up your discount. For example, 2-.50|10-3|50-5 means "between 2 and 9 is discounted by .5 per product, 10 and 49 by 3 per product and 50 and over by 5 per product. If you're doing a quantity discount, it will compare against the quantity of products in the order. If you're doing a price based discount, it will compare against the price of the products in the order. Please see the documentation for more information: {@link http://wiki.foxycart.com/v/2.0/coupons_and_discounts Coupons and Discounts} */
    coupon_discount_details: string;
    /** If this coupon can be combined with other coupons, check this check box. If this box is unchecked, the coupon will not be added to the cart if another coupon is already in the cart. Similarly, if this coupon is added first, no other coupons will be able to be added to the cart. */
    combinable: boolean;
    /** Set to true if you want to allow your customers to use multiple coupon codes from this coupon on the same order. If false, the customer will see an error if they try to add another coupon code if one for this coupon is already in the cart. */
    multiple_codes_allowed: boolean;
    /** Set to true if you want to ensure category discounts are not applied for an order that uses this coupon. */
    exclude_category_discounts: boolean;
    /** Set to true if you want to ensure line item discounts are not applied to any products for an order that uses this coupon. */
    exclude_line_item_discounts: boolean;
    /** Set to true to apply taxes before this coupon's discount is applied. Check with your tax professional if you have questions about how you should calculate taxes. */
    is_taxable: boolean;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  zooms: {
    coupon_item_categories?: FxCouponItemCategories;
    coupon_codes?: FxCouponCodes;
  };
}
