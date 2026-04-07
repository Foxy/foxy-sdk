export type Format = {
  /** Default weight unit for display. */
  weight_unit: "pound" | "kilogram";
  /** Locale code for formatting (e.g., 'en-US'). */
  locale_code: string;
  /** 3-letter currency code (e.g., 'USD'). */
  currency_code: string;
  /** How to display currency (symbol, code, or none). */
  currency_display: "symbol" | "code" | "none";
  /** Maximum number of decimal places for prices. */
  maximum_fraction_digits: number;
};
