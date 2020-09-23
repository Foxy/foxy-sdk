/**
 * @file Relation name mappings (name to compact URI).
 * @description
 *
 * Relations in our hAPI can be used in one of three forms.
 * Here's an example of the customer relation:
 *
 * - full URI: `https://api.foxycart.com/rels/customer`
 * - compact URI: `fx:customer`
 * - relation name: `customer`
 *
 * Devs will rarely use the full URI with this package, however, they may find themselves
 * using the compact URIs and the relation names all the time, e.g. in the zoom
 * query parameter (relation name) and while working with embedded resources (compact URI).
 *
 * Since TypeScript 3 can't do string literal manipulation during type mapping, we have to
 * map relation names to their compact URI versions by hand in this file.
 *
 * This interface MUST include every relation mapping used in zoomable resources and
 * it MAY contain other mappings for consistency.
 */

/** Relation name mappings (name to compact URI). */
export interface Relations {
  default_shipping_address: "fx:default_shipping_address";
  default_billing_address: "fx:default_billing_address";
  store_shipping_services: "fx:store_shipping_services";
  coupon_item_categories: "fx:coupon_item_categories";
  default_payment_method: "fx:default_payment_method";
  cart_include_template: "fx:cart_include_template";
  transaction_template: "fx:transaction_template";
  original_transaction: "fx:original_transaction";
  shipping_container: "fx:shipping_container";
  shipping_drop_type: "fx:shipping_drop_type";
  billing_addresses: "fx:billing_addresses";
  checkout_template: "fx:checkout_template";
  customer_address: "fx:customer_address";
  last_transaction: "fx:last_transaction";
  discount_details: "fx:discount_details";
  receipt_template: "fx:receipt_template";
  shipping_method: "fx:shipping_method";
  email_template: "fx:email_template";
  coupon_details: "fx:coupon_details";
  applied_taxes: "fx:applied_taxes";
  cart_template: "fx:cart_template";
  custom_fields: "fx:custom_fields";
  item_category: "fx:item_category";
  item_options: "fx:item_options";
  transactions: "fx:transactions";
  coupon_code: "fx:coupon_code";
  attributes: "fx:attributes";
  shipments: "fx:shipments";
  discounts: "fx:discounts";
  customer: "fx:customer";
  payments: "fx:payments";
  items: "fx:items";
}
