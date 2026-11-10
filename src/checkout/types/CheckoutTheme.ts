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
  /** Color of success messages and confirmed states. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  success_color?: string | null;
  /** Corner radius of fields, cards and buttons. One of `medium`, `none`, `small`, `large`. Default: `medium`. A number is ignored. Missing or null = default. */
  corner_radius?: "medium" | "none" | "small" | "large" | null;
  /** Width of field and card borders. One of `thin`, `none`, `medium`, `thick`. Default: `thin`. A number is ignored. Missing or null = default. */
  border_width?: "thin" | "none" | "medium" | "thick" | null;
  /** Shape of buttons. One of `match` (use the corner radius), `square`, `pill`. Default: `match`. Missing or null = default. */
  button_shape?: "match" | "square" | "pill" | null;
  /** Letter case of button labels. One of `normal`, `uppercase`. Default: `normal`. Missing or null = default. */
  button_text?: "normal" | "uppercase" | null;
  /** Font weight of button labels. One of `medium`, `regular`, `bold`. Default: `medium`. Missing or null = default. */
  button_weight?: "medium" | "regular" | "bold" | null;
  /** Shadow of cards and panels. One of `none`, `soft`, `medium`, `hard`. Default: `none`. Missing or null = default. */
  shadow?: "none" | "soft" | "medium" | "hard" | null;
  /** Layout of checkout sections. One of `cards` (each section in a card), `plain` (no card around sections). Default: `cards`. Missing or null = default. */
  sections?: "cards" | "plain" | null;
  /** Font family for body text: a Google Fonts name. Letters, digits and spaces only, 1 to 64 characters. Missing or null = the system font. */
  font_family?: string | null;
  /** Font family for headings. Same format as `font_family`. Missing or null = the system font. */
  heading_font_family?: string | null;
};
