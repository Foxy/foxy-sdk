import type { BillingAddress } from "./billing-address";
import type { CustomFields } from "./custom-fields";
import type { Item } from "./item";
import type { Message } from "./message";
import type { Shipment } from "./shipment";
import type { Coupon, GiftCard } from "./totals";

export type APIEventMap = {
  "billing-address-update": CustomEvent<BillingAddress>;
  "cart-clear": Event;
  checkout: Event;
  "coupon-or-gift-card-apply": CustomEvent<{ code: string }>;
  "coupon-remove": CustomEvent<{ coupon: Coupon }>;
  "custom-fields-update": CustomEvent<CustomFields>;
  "email-update": CustomEvent<{ email: string }>;
  "gift-card-remove": CustomEvent<{ giftCard: GiftCard }>;
  "item-remove": CustomEvent<{ item: Item }>;
  "item-update": CustomEvent<{ oldItem: Item; newItem: Item }>;
  "messages-add": CustomEvent<{ message: Message }>;
  "messages-clear": Event;
  "messages-remove": CustomEvent<{ message: Message }>;
  "shipment-update": CustomEvent<Shipment>;
  "sign-in": CustomEvent<{ email: string; password: string }>;
  "sign-out": Event;
  "temporary-password-request": CustomEvent<{ email: string }>;
  update: Event;
};
