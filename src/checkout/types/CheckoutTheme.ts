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
  /** Corner radius of cards, sections, dialogs and popovers. One of `medium`, `none`, `small`, `large`. Default: `medium`. Missing or null = default. */
  surface_radius?: "medium" | "none" | "small" | "large" | null;
  /** Corner radius of fields, selects, quantity controls and buttons inside a group. One of `medium`, `none`, `small`, `large`, `pill`. Default: `medium`. Missing or null = default. */
  control_radius?: "medium" | "none" | "small" | "large" | "pill" | null;
  /** Width of field and card borders. One of `thin`, `none`, `medium`, `thick`. Default: `thin`. A number is ignored. Missing or null = default. */
  border_width?: "thin" | "none" | "medium" | "thick" | null;
  /** Shape of standalone buttons. One of `match` (use the control radius), `square`, `pill`. Default: `match`. Missing or null = default. */
  button_shape?: "match" | "square" | "pill" | null;
  /** Letter case of button labels. One of `normal`, `uppercase`. Default: `normal`. Missing or null = default. */
  button_text?: "normal" | "uppercase" | null;
  /** Font weight of button labels. One of `medium`, `regular`, `bold`. Default: `medium`. Missing or null = default. */
  button_weight?: "medium" | "regular" | "bold" | null;
  /**
   * Shadow of cards and panels: `"<x>px <y>px <blur>px <spread>px <color>"`, e.g.
   * `"0px 4px 12px 0px #0000001F"`. Whole numbers; x, y and spread from -40 to 40, blur from
   * 0 to 80, out-of-range numbers are clamped. Color: `#RRGGBB` or `#RRGGBBAA`. Missing, null or
   * any other format = no shadow.
   */
  surface_shadow?: string | null;
  /** Shadow of select lists, dialogs, popovers and tooltips. Same format as `surface_shadow`. Missing, null or any other format = no shadow. */
  popup_shadow?: string | null;
  /** Layout of checkout sections. One of `cards` (each section in a card), `plain` (no card around sections). Default: `cards`. Missing or null = default. */
  sections?: "cards" | "plain" | null;
  /** Font family for body text: a Google Fonts name. Letters, digits and spaces only, 1 to 64 characters. Missing or null = the system font. */
  font_family?: string | null;
  /** Font family for headings. Same format as `font_family`. Missing or null = the system font. */
  heading_font_family?: string | null;
  /**
   * Design-system component overrides: component → part → state → CSS property → value,
   * with `variant` and `size` keys where a component has them. The checkout keeps only
   * known keys and safe values and ignores the whole object above 16 KB. Missing or null = none.
   */
  overrides?: Record<string, unknown> | null;
};
