export type Display = {
  /** Product option names to hide from display (includes sub_frequency, code, category, etc). */
  hidden_product_options: string[];
  /** Form field names that are required. */
  required_form_fields: string[];
  /** Form field names to hide from display. */
  hidden_form_fields: string[];
  /** Whether to use a read-only cart display during checkout. */
  use_readonly_cart_on_checkout: boolean;
  /** Whether prices include tax. */
  use_tax_inclusive_pricing: boolean;
  /** Requirement level for secure data transfer consent. */
  secure_data_transfer_consent: "required" | "optional" | "disabled";
  /** The type of checkout flow to use. */
  checkout_flow: "default" | "subscription_cancellation" | "subscription_modification";
  /** Customer registration requirement. */
  registration: "required" | "optional" | "disabled";
  /**
   * How the loader handles add-to-cart links and forms on the merchant's
   * pages: `default` opens the cart drawer, `fullpage` goes to the cart page,
   * and `custom` leaves them alone. Missing means `default`.
   */
  cart_type?: "default" | "fullpage" | "custom";
};
