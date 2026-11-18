/**
 * Theme for the checkout. Every key is optional. A missing or null key, or a
 * value in the wrong format, keeps the default.
 */
export type CheckoutTheme = {
  /** Background of the page behind the checkout. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  page_background?: string | null;
  /** Background of cards and panels. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  surface_background?: string | null;
  /** Background of fields, selects and other inputs. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = the surface background. */
  field_background?: string | null;
  /** Color of field borders. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = `border_color`. */
  field_border_color?: string | null;
  /** Width of field borders. Same format and range as `border_width`; `0rem` removes them. Missing, null or any other format = `border_width`. */
  field_border_width?: string | null;
  /** Color of body text. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  text_color?: string | null;
  /** Color of hints, labels and other muted text. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  secondary_text_color?: string | null;
  /** Color of links, focus rings and selected states. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  accent_color?: string | null;
  /** Background of primary buttons. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  button_color?: string | null;
  /** Background of outline buttons. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = transparent. */
  outline_button_color?: string | null;
  /** Color of error messages and invalid fields. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  error_color?: string | null;
  /** Color of card borders, dividers and alerts. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  border_color?: string | null;
  /** Color of success messages and confirmed states. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = default. */
  success_color?: string | null;
  /**
   * Corner radius of cards, sections and dialogs: `"<n>rem"`, n from 0 to 2 with up to 4 decimals,
   * clamped. Smaller surfaces (popovers, badges) use half and a quarter of it. Default: `1rem`.
   * Missing, null or any other format = default.
   */
  surface_radius?: string | null;
  /**
   * Corner radius of fields, selects, quantity controls and buttons inside a group: `"<n>rem"`, n
   * from 0 to 1.5 with up to 4 decimals, clamped, or `"pill"`. Default: `0.5rem`. Missing, null or
   * any other format = default.
   */
  control_radius?: string | null;
  /** Width of card borders, dividers and alerts: `"<n>rem"`, n from 0 to 0.5 with up to 4 decimals, clamped. Default: `0.0625rem` (1px). Missing, null or any other format = default. */
  border_width?: string | null;
  /** Corner radius of standalone buttons. Same format and range as `control_radius`. Missing, null or any other format = the control radius. */
  button_radius?: string | null;
  /** Width of button borders. Same format and range as `border_width`. Missing, null or any other format = `field_border_width`. */
  button_border_width?: string | null;
  /** Letter case of button labels. One of `normal`, `uppercase`. Default: `normal`. Missing or null = default. */
  button_text?: "normal" | "uppercase" | null;
  /** Letter case of field labels. One of `normal`, `uppercase`. Default: `normal`. Missing or null = default. */
  field_label_text?: "normal" | "uppercase" | null;
  /**
   * Shadow of cards and panels: `"<x>px <y>px <blur>px <spread>px <color>"`, e.g.
   * `"0px 4px 12px 0px #0000001F"`. Whole numbers; x, y and spread from -40 to 40, blur from
   * 0 to 80, out-of-range numbers are clamped. Color: `#RRGGBB` or `#RRGGBBAA`. Missing, null or
   * any other format = no shadow.
   */
  surface_shadow?: string | null;
  /** Shadow of select lists, dialogs, popovers and tooltips. Same format as `surface_shadow`. Missing, null or any other format = no shadow. */
  popup_shadow?: string | null;
  /** Shadow of fields, selects, checkboxes, radios and switches. Same format as `surface_shadow`. Missing, null or any other format = no shadow. */
  field_shadow?: string | null;
  /** Shadow of filled and outline buttons. Same format as `surface_shadow`. Missing, null or any other format = no shadow. */
  button_shadow?: string | null;
  /** Background of select lists, dialogs, popovers, tooltips and the side cart. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = the surface background. */
  popup_background?: string | null;
  /** Color of popup borders. Hex color: `#RRGGBB` or `#RRGGBBAA`. Missing or null = `border_color`. */
  popup_border_color?: string | null;
  /** Corner radius of popups. Same format and range as `surface_radius`; smaller popups (select lists, popovers, tooltips) use half and a quarter of it. Missing, null or any other format = the surface radius. */
  popup_radius?: string | null;
  /** Width of popup borders. Same format and range as `border_width`; `0rem` removes them. Missing, null or any other format = the border width. */
  popup_border_width?: string | null;
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
