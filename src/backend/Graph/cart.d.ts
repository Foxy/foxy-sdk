import type { AppliedCouponCodes } from './applied_coupon_codes';
import type { Attributes } from './attributes';
import type { CreateSession } from './create_session';
import type { CustomFields } from './custom_fields';
import type { Customer } from './customer';
import type { Discounts } from './discounts';
import type { Graph } from '../../core';
import type { Items } from './items';
import type { Store } from './store';
import type { Subscription } from './subscription';

export interface Cart extends Graph {
  curie: 'fx:cart';

  links: {
    /** This resource. */
    'self': Cart;
    /** Store this cart was created in. */
    'fx:store': Store;
    /** Items in this cart. */
    'fx:items': Items;
    /** Customer who created this cart. */
    'fx:customer': Customer;
    /** Discounts applied to the products in this cart. */
    'fx:discounts': Discounts;
    /** Various attributes of this cart. */
    'fx:attributes': Attributes;
    /** Subscription linked to this cart. */
    'fx:subscription': Subscription;
    /** Custom fields applied to this cart. */
    'fx:custom_fields': CustomFields;
    /** POST here to create a browser session link. */
    'fx:create_session': CreateSession;
    /** Coupon codes applied to the items in this cart. */
    'fx:applied_coupon_codes': AppliedCouponCodes;
  };

  props: {
    /**
     * The full API URI of the customer this cart is associated with. You can not POST a cart into a transaction (ie. charge a customer's saved payment method) unless this value is set to a valid customer with an active default payment method.
     *
     * Guest (ie. `is_anonymous=1` customer resources *can* be used, but be aware that guest customer payment methods are purged regularly and according to various internal criteria. As such, so you should not rely on a guest customer's saved credit card being usable indefinitely. In general, you shouldn't rely on a saved payment method persisting more than 60 days, though this value is subject to change. (And, of course, there's no guarantee for *any* saved payment method that it will work in the future, so always be sure to handle payment errors on your end.)
     *
     * Note that when this value is included, the customer's `shipping_*` and `billing_*` values will populate *and override* any existing values on the `cart` resource (unless the address values are PUT or PATCHed in the same request, in which case the explicitly set values will be used).
     *
     * Note that if you are using the `customer_uri` value, you'll likely either want to explicitly set the `use_customer_shipping_address` value.
     */
    customer_uri: string;
    /**
     * This value will be populated when `customer_uri` is set, but can be set separately (for instance, if the customer is unknown or new. This is *not* used for pre-population on the checkout, but can be helpful in certain situations (such as cart abandonment tracking).
     *
     * Note that setting `customer_uri` will overwrite this value, and you will receive an error if you set both `customer_email` and `customer_uri` with a mismatched email address.
     */
    customer_email: string;
    /**
     * The full API URI of the `fx:payments` resource, from a previous transaction. This can be used *in addition to* the `customer_uri`, to specify a specific payment method used in the past. Without this value, the customer's default saved payment method will be used instead.
     *
     * This can be helpful in certain situations, such as when a customer may use multiple different payment methods, but you need to use the API to charge a specific payment method. For instance, if a customer makes 3 transactions with 3 different credit cards, and you need to add a charge to the 2nd card used. Without this `payment_method_uri`, the *most recent* card would be charged.
     *
     * **IMPORTANT NOTES:**
     * - Not all payment methods can be used this way. Current support includes: normal credit card gateways; CyberSource card-present / point-of-sale, PayPal Express Checkout Reference Transaction, Amazon Pay and Adyen Embedded.
     * - Some gateways will only use the last payment method for the customer for that gateway, even if you might be using a `payment_method_uri` from a transaction that had used an earlier payment method for that gateway. These include PayPal Express Checkout Reference Transaction, Amazon Pay, Stripe Connect, Square and Adyen Embedded.
     * - If you're interested in this functionality and not sure if all of your chosen payment gateways are supported, please get in touch with Foxy support.
     */
    payment_method_uri: string;
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
    billing_region: string;
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
    shipping_region: string;
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
    /** The 3 character ISO code for the currency. This value may be unavailable in some carts. */
    currency_code?: string;
    /** The currency symbol, such as $, £, €, etc. This value may be unavailable in some carts. */
    currency_symbol?: string;
    /** Total amount of the items in this cart. */
    total_item_price: number;
    /** Total amount of the taxes for this cart. */
    total_tax: number;
    /** Total amount of the shipping costs for this cart. */
    total_shipping: number;
    /** If this cart has any shippable subscription items which will process in the future, this will be the total amount of shipping costs for those items. */
    total_future_shipping: number;
    /** Total order amount of this cart including all items, taxes, shipping costs and discounts. */
    total_order: number;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };

  zooms: {
    custom_fields?: CustomFields;
    attributes: Attributes;
    discounts?: Discounts;
    customer?: Customer;
    items?: Items;
  };
}
