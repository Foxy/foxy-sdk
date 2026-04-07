export type Tax = {
  /** Tax name. */
  name: string;
  /** Tax rate as a decimal (e.g., 0.08 for 8%). */
  rate: number;
  /** Tax amount. */
  amount: number;
  /** Whether this tax is included in the item prices. */
  is_included: boolean;
};

export type Coupon = {
  /** Unique identifier for the coupon. */
  id: number;
  /** Coupon code. */
  code: string;
  /** Code ID. */
  code_id: number;
  /** Display name for the coupon. */
  name: string;
  /** Discount amount. */
  amount: number;
  /** Whether the coupon discount is subject to tax. */
  is_taxable: boolean;
  /** Whether this coupon was applied automatically. */
  is_auto_apply: boolean;
};

export type GiftCard = {
  /** Unique identifier for the gift card. */
  id: number;
  /** Gift card code. */
  code: string;
  /** Code ID. */
  code_id: number;
  /** Display name for the gift card. */
  name: string;
  /** Amount applied to this order. */
  amount: number;
  /** Remaining balance on the gift card before this order. */
  current_balance: number;
};

export type Totals = {
  /** Date for this totals snapshot (null means current/now). */
  date: string | null;
  /** Array of applicable taxes. */
  taxes: Tax[];
  /** Array of applied coupon codes. */
  coupons: Coupon[];
  /** Array of applied gift cards (empty for future totals snapshots). */
  gift_cards: GiftCard[];
  /** Total discount amount from all line item discounts. */
  total_line_item_discount: number;
  /** Total shipping cost before tax. */
  total_shipping: number;
  /** Total shipping cost including tax. */
  total_shipping_with_tax: number;
  /** Shippable value for calculating shipping. */
  total_shipping_value: number;
  /** Total tax amount. */
  total_tax: number;
  /** Total price of all items before tax. */
  total_item_price: number;
  /** Total price of all items including tax. */
  total_item_price_with_tax: number;
  /** Total weight of all items. */
  total_weight: number;
  /** Total weight of shippable items. */
  total_weight_shippable: number;
  /** Final order total after all discounts and taxes. */
  total_order: number;
};
