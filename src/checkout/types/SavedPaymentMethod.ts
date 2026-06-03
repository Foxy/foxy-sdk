import type {
  StandardCardGateway,
  StripeConnectGateway,
} from "./PaymentGatewayConfig";

export type SavedPaymentMethod = {
  /** Payment option type. */
  type: "card";
  /** Gateway used for saved card submission. */
  gateway:
    | StandardCardGateway
    | StripeConnectGateway
    | "stripe_v2"
    | "adyen_embedded";
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
};
