import type { CheckoutTheme } from "./types/CheckoutTheme";

export type { CheckoutTheme };

type Rgb = [number, number, number];

const COLOR = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/;
const REM = /^(\d+(?:\.\d{1,4})?)rem$/;
const SHADOW =
  /^(-?\d+)px (-?\d+)px (\d+)px (-?\d+)px #[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?$/;
const WHITE: Rgb = [255, 255, 255];

/** Parses `#RRGGBB[AA]` and composites it over `over` (white by default). */
function parse(hex: unknown, over: Rgb = WHITE): Rgb | null {
  const match = typeof hex === "string" ? COLOR.exec(hex) : null;
  if (!match) return null;
  const n = parseInt(match[1], 16);
  const a = match[2] ? parseInt(match[2], 16) / 255 : 1;
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return [0, 1, 2].map((i) => c[i] * a + over[i] * (1 - a)) as Rgb;
}

function toHex(c: Rgb): string {
  const byte = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c.map(byte).join("")}`.toUpperCase();
}

/** Linear per channel. `t` is the weight of `b`. */
function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t) as Rgb;
}

function luminance(c: Rgb): number {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Moves `c` toward `target` in 2% steps until it reaches `ratio` against `base`. */
function moveUntil(c: Rgb, target: Rgb, base: Rgb, ratio: number): Rgb {
  for (let t = 0; t <= 1; t += 0.02) {
    const candidate = mix(c, target, t);
    if (contrast(candidate, base) >= ratio) return candidate;
  }
  return target;
}

// Format only: the checkout clamps out-of-range numbers, so they count as set.
const rem = (pill: boolean) => (v: unknown) =>
  typeof v === "string" && ((pill && v === "pill") || REM.test(v));

const isColor = (v: unknown) => parse(v) !== null;
const isCase = (v: unknown) => v === "normal" || v === "uppercase";

const isShadow = (v: unknown) => typeof v === "string" && SHADOW.test(v);

/** What a lower key accepts. Keys that are not here are left alone. */
const VALID: Record<string, (v: unknown) => boolean> = {
  surface_background: isColor,
  popup_background: isColor,
  field_background: isColor,
  border_color: isColor,
  popup_border_color: isColor,
  field_border_color: isColor,
  secondary_text_color: isColor,
  surface_radius: rem(false),
  popup_radius: rem(false),
  control_radius: rem(true),
  button_radius: rem(true),
  border_width: rem(false),
  popup_border_width: rem(false),
  field_border_width: rem(false),
  button_border_width: rem(false),
  surface_shadow: isShadow,
  popup_shadow: isShadow,
  field_shadow: isShadow,
  button_shadow: isShadow,
  button_text: isCase,
  field_label_text: isCase,
};

const RADII = {
  sharp: ["0rem", "0rem", "0rem"],
  subtle: ["0.5rem", "0.25rem", "0.25rem"],
  regular: ["1rem", "0.5rem", "0.5rem"],
  soft: ["1.5rem", "0.75rem", "pill"],
} as const;
const WIDTHS = {
  none: "0rem",
  thin: "0.0625rem",
  medium: "0.125rem",
  bold: "0.1875rem",
} as const;
const SHADOWS = {
  none: [],
  light: ["0px 1px 2px 0px #0000000F", "0px 4px 12px 0px #0000001A"],
  medium: [
    "0px 2px 8px 0px #00000014",
    "0px 8px 24px 0px #0000001F",
    "0px 1px 2px 0px #0000000D",
    "0px 1px 2px 0px #0000001A",
  ],
  heavy: [
    "0px 8px 24px 0px #0000001F",
    "0px 16px 40px 0px #00000029",
    "0px 1px 3px 0px #00000014",
    "0px 2px 6px 0px #00000026",
  ],
} as const;

const has = (table: object, key: unknown): boolean =>
  typeof key === "string" && Object.prototype.hasOwnProperty.call(table, key);

/**
 * Fills the detailed theme keys from the theme-level ones (`page_background`, `text_color`,
 * `corners`, `outlines`, `shadows`). A detailed key that holds a valid value is kept. A missing,
 * null or invalid one is derived from the theme-level keys only, never from another detailed
 * key; if nothing can be derived it is left as it was. Pure: returns a new object.
 */
export function resolveCheckoutTheme(
  theme: CheckoutTheme | null | undefined,
): CheckoutTheme {
  const input: CheckoutTheme = theme ?? {};
  const derived: Record<string, string> = {};

  const bg = parse(input.page_background);
  const page = bg ?? parse("#FAFAFA")!;
  const fg = parse(input.text_color, page);
  if (bg || fg) {
    const text = fg ?? parse("#1A1A1A", page)!;
    const toWhite = contrast(page, [0, 0, 0]) < contrast(page, WHITE);
    const lifted = mix(page, WHITE, toWhite ? 0.06 : 0.7);
    const border = toHex(mix(text, page, 0.82));
    derived.surface_background =
      derived.popup_background =
      derived.field_background =
        toHex(lifted);
    derived.border_color = derived.popup_border_color = border;
    derived.field_border_color = toHex(
      moveUntil(mix(text, page, 0.55), text, lifted, 3),
    );
    derived.secondary_text_color = toHex(
      moveUntil(mix(text, page, 0.35), text, lifted, 4.5),
    );
  }

  if (has(RADII, input.corners)) {
    const [surface, control, button] =
      RADII[input.corners as keyof typeof RADII];
    derived.surface_radius = derived.popup_radius = surface;
    derived.control_radius = control;
    derived.button_radius = button;
  }

  if (has(WIDTHS, input.outlines)) {
    const width = WIDTHS[input.outlines as keyof typeof WIDTHS];
    derived.border_width =
      derived.popup_border_width =
      derived.button_border_width =
        width;
    derived.field_border_width =
      input.outlines === "none" ? WIDTHS.thin : width;
  }

  if (input.shadows === "sharp") {
    const ink = fg ? (input.text_color as string) : "#1A1A1A";
    const hard = (n: number) => `${n}px ${n}px 0px 0px ${ink}`;
    derived.surface_shadow = derived.popup_shadow = hard(4);
    derived.field_shadow = derived.button_shadow = hard(2);
  } else if (has(SHADOWS, input.shadows)) {
    const [surface, popup, field, button] = SHADOWS[
      input.shadows as keyof typeof SHADOWS
    ] as readonly string[];
    if (surface) derived.surface_shadow = surface;
    if (popup) derived.popup_shadow = popup;
    if (field) derived.field_shadow = field;
    if (button) derived.button_shadow = button;
  }

  const result: Record<string, unknown> = { ...input };
  for (const key of Object.keys(derived)) {
    if (!VALID[key](result[key])) result[key] = derived[key];
  }
  return result as CheckoutTheme;
}
