import type { StandardCardGateway } from "./PaymentGatewayConfig";

export type SavedPaymentMethod = {
  /** Payment option type. */
  type: "card";
  /** Gateway used for saved card submission. */
  gateway: StandardCardGateway | "stripe_v2" | "adyen_embedded";
  /** Payment method identifier. */
  id: string;
  /** Card brand (e.g., "visa", "mastercard"). */
  brand: string;
  /** Last 4 card digits (e.g., "1234"). */
  last_4: string;
  /** Full expiration year (e.g., 2030). */
  expiry_year: number;
  /** Expiration month from 1 to 12. */
  expiry_month: number;
  /**
   * The store wants the card's security code before it is charged. When true,
   * submit a `card_token` minted in `card_csc` mode for this card alongside
   * `saved_payment_method_id`; when false, the id alone charges it.
   */
  csc_required: boolean;
};
