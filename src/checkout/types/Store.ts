export type Store = {
  /** Store identifier. */
  id: number;
  /** Store name. */
  name: string;
  /** Store domain. */
  domain: string;
  /** URL to the store logo. */
  logo_url: string;
  /** Store website URL. */
  website_url: string;
  /** Store checkout URL. */
  checkout_url: string;
  /** Cancel or Continue Shopping URL. */
  cancel_and_continue_url: string;
  /** Whether this store has taxes that are calculated based on customer location. */
  has_location_dependent_taxes: boolean;
  /** Whether this store has gift cards that can be applied to this order. */
  has_eligible_gift_cards: boolean;
  /** Whether this store has coupons that can be applied to this order. */
  has_eligible_coupons: boolean;
  /** Array of supported payment card types. */
  supported_payment_cards: string[];
};
