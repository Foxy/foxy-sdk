export type ItemOption = {
  id: number;
  /** Option name. */
  name: string;
  /** Option value. */
  value: string;
  /** Price modifier for this option. */
  price_mod: number;
  /** Weight modifier for this option in the item's weight unit. */
  weight_mod: number;
};

export type Item = {
  /** Unique identifier for the item. */
  id: number;
  /** Display name of the item. */
  name: string;
  /** Product code. */
  code: string | null;
  /** Parent product code. If set, this item is a child item. */
  parent_code: string | null;
  /** URL to the item's image. */
  image: string | null;
  /** URL to the item on the store. */
  url: string | null;
  /** Length dimension. */
  length: number | null;
  /** Unit of measurement for length. */
  length_unit: "inch" | "centimeter";
  /** Width dimension. */
  width: number | null;
  /** Height dimension. */
  height: number | null;
  /** Weight of the item. */
  weight: number | null;
  /** Unit of measurement for weight. */
  weight_unit: "pound" | "kilogram";
  /** Quantity in the cart. */
  quantity: number;
  /** Minimum quantity allowed. If this value is non-zero and parent code is present, then the quantity of this item is locked to its parent. */
  quantity_min: number;
  /** Maximum quantity allowed. If null then there is no maximum limit. */
  quantity_max: number | null;
  /** Price per unit before any discounts are applied. */
  base_price: number;
  /** Price per unit after discounts but before tax. */
  price_each: number;
  /** Price per unit including tax. */
  price_each_with_tax: number;
  /** Total price for all units of this item before tax. */
  price: number;
  /** Total price for all units of this item including tax. */
  price_with_tax: number;
  /** Category code for this item. */
  item_category_code: string;
  /** How the item will be delivered. */
  item_delivery_type: "shipped" | "downloaded" | "flat_rate" | "pickup" | "notshipped";
  /** Delivery type code. */
  delivery_type: string;
  /** Identifier for downloadable product. */
  downloadable_id: number | null;
  /** URL to download the product (only available after purchase). */
  downloadable_url: string | null;
  /** Subscription frequency in format like '1m', '1y', or '.5m'. */
  subscription_frequency: `${number}${"y" | "m" | "w" | "d"}` | ".5m" | null;
  /** Subscription start date in YYYY-MM-DD format. */
  subscription_start_date: string | null;
  /** Next transaction date for subscription in YYYY-MM-DD format. */
  subscription_next_transaction_date: string | null;
  /** Subscription end date in YYYY-MM-DD format. */
  subscription_end_date: string | null;
  /** Item expiration date in ISO 8601 format. */
  expires: string | null;
  /** Product options for this item. */
  options: ItemOption[];
};
