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
  /** Corner radius of fields, cards and buttons. One of `none`, `small`, `medium`, `large`. Default is first listed: `none`. A number is ignored. Missing or null = default. */
  corner_radius?: "none" | "small" | "medium" | "large" | null;
  /** Width of field and card borders. One of `none`, `thin`, `medium`, `thick`. Default is first listed: `none`. A number is ignored. Missing or null = default. */
  border_width?: "none" | "thin" | "medium" | "thick" | null;
  /** Shape of buttons. One of `match` (use the corner radius), `square`, `pill`. Default is first listed: `match`. Missing or null = default. */
  button_shape?: "match" | "square" | "pill" | null;
  /** Letter case of button labels. One of `normal`, `uppercase`. Default is first listed: `normal`. Missing or null = default. */
  button_text?: "normal" | "uppercase" | null;
  /** Font weight of button labels. One of `regular`, `medium`, `bold`. Default is first listed: `regular`. Missing or null = default. */
  button_weight?: "regular" | "medium" | "bold" | null;
  /** Shadow of cards and panels. One of `none`, `soft`, `medium`, `hard`. Default is first listed: `none`. Missing or null = default. */
  shadow?: "none" | "soft" | "medium" | "hard" | null;
  /** Layout of checkout sections. One of `cards` (each section in a card), `plain` (no card around sections). Default is first listed: `cards`. Missing or null = default. */
  sections?: "cards" | "plain" | null;
  /** Font family for body text: a system font or a Google Font name. Letters, digits and spaces only, 1 to 64 characters. Missing or null = default. */
  font_family?: string | null;
  /** Font family for headings. Same format as `font_family`. Missing or null = default. */
  heading_font_family?: string | null;
};
