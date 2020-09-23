/**
 * @file Zoomable resources.
 * @description
 *
 * Some resources, like subscriptions, can be zoomed on, giving devs an ability
 * to request all (or some) related resources without making extra requests.
 *
 * Such resources are described in a special type of `ApiGraph` that includes
 * compact URIs of the resources where zoom is enabled on child resources as root nodes
 * and zoomable relation names as child nodes. Each node MUST include a subset of
 * keys from the appropriate `Graph` node, each transformed into a relation name.
 */

/**
 * Resources where zooming is enabled with the list of
 * the zoomable resources, where `never` indicates that no further
 * zoom is possible.
 */
export interface Zoomable {
  "fx:store_shipping_method": {
    store_shipping_services: never;
    shipping_container: never;
    shipping_drop_type: never;
    shipping_method: never;
  };

  "fx:subscription": {
    original_transaction: Zoomable["fx:transaction"];
    transaction_template: Zoomable["fx:cart"];
    last_transaction: Zoomable["fx:transaction"];
    transactions: Zoomable["fx:transactions"];
    attributes: never;
    customer: Zoomable["fx:customer"];
  };

  "fx:template_set": {
    cart_include_template: never;
    checkout_template: never;
    receipt_template: never;
    email_template: never;
    cart_template: never;
  };

  "fx:transaction": {
    billing_addresses: never;
    applied_taxes: never;
    custom_fields: never;
    attributes: never;
    discounts: never;
    shipments: never;
    customer: Zoomable["fx:customer"];
    payments: never;
    items: Zoomable["fx:item"];
  };

  "fx:customer": {
    default_shipping_address: never;
    default_billing_address: never;
    default_payment_method: never;
    customer_addresses: never;
    attributes: never;
  };

  "fx:coupon": {
    coupon_item_categories: never;
    coupon_codes: never;
  };

  "fx:item": {
    discount_details: never;
    coupon_details: never;
    item_category: never;
    item_options: never;
  };

  "fx:cart": {
    custom_fields: never;
    attributes: never;
    discounts: never;
    customer: Zoomable["fx:customer"];
    items: Zoomable["fx:item"];
  };

  "fx:store_shipping_methods": Zoomable["fx:store_shipping_method"];
  "fx:subscriptions": Zoomable["fx:subscription"];
  "fx:template_sets": Zoomable["fx:template_set"];
  "fx:transactions": Zoomable["fx:transaction"];
  "fx:customers": Zoomable["fx:customer"];
  "fx:coupons": Zoomable["fx:coupon"];
  "fx:carts": Zoomable["fx:cart"];
  "fx:items": Zoomable["fx:item"];
}

/**
 * A union type including compact URIs of the resources that
 * will be added to the response regardless of the `zoom` parameter value if
 * such link is found.
 */
export type DefaultZoom = "fx:attributes";
