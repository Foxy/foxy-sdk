/**
 * Theme for the checkout. Every key is optional. A missing or null key, or a
 * value in the wrong format, keeps the default.
 */
export type CheckoutTheme = {
  /** Background of the page behind the checkout. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  page_background?: string | null;
  /** Background of cards and panels. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  surface_background?: string | null;
  /** Color of body text. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  text_color?: string | null;
  /** Color of hints, labels and other muted text. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  secondary_text_color?: string | null;
  /** Color of links, focus rings and selected states. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  accent_color?: string | null;
  /** Background of primary buttons. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  button_color?: string | null;
  /** Color of error messages and invalid fields. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  error_color?: string | null;
  /** Color of field and card borders. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  border_color?: string | null;
  /** Width of field and card borders in pixels. Integer from 0 to 4. Missing or null = default. */
  border_width?: number | null;
  /** Corner radius of fields, cards and buttons in pixels. Integer from 0 to 24. Missing or null = default. */
  corner_radius?: number | null;
  /** Font family for all text: a system font or a Google Font name. Letters, digits and spaces only, 1 to 64 characters. Missing or null = default. */
  font_family?: string | null;
};
