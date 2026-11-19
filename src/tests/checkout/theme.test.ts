import { resolveCheckoutTheme } from "../../checkout/theme";
import type { CheckoutTheme } from "../../checkout/types/CheckoutTheme";

const rgb = (hex: string) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lin = (v: number) =>
  (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
const lum = (hex: string) => {
  const [r, g, b] = rgb(hex).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const HEX = /^#[0-9A-F]{6}$/;

describe("resolveCheckoutTheme", () => {
  it("returns an equal new object when no theme keys are set", () => {
    const input: CheckoutTheme = {
      button_color: "#112233",
      surface_radius: "3rem",
      overrides: { a: 1 },
    };
    const out = resolveCheckoutTheme(input);
    expect(out).toEqual(input);
    expect(out).not.toBe(input);
    expect(resolveCheckoutTheme(null)).toEqual({});
    expect(resolveCheckoutTheme(undefined)).toEqual({});
  });

  it.each([
    ["sharp", "0rem", "0rem", "0rem"],
    ["subtle", "0.5rem", "0.25rem", "0.25rem"],
    ["regular", "1rem", "0.5rem", "0.5rem"],
    ["soft", "1.5rem", "0.75rem", "pill"],
  ] as const)("corners %s", (corners, surface, control, button) => {
    expect(resolveCheckoutTheme({ corners })).toEqual({
      corners,
      surface_radius: surface,
      popup_radius: surface,
      control_radius: control,
      button_radius: button,
    });
  });

  it.each([
    ["none", "0rem", "0.0625rem"],
    ["thin", "0.0625rem", "0.0625rem"],
    ["medium", "0.125rem", "0.125rem"],
    ["bold", "0.1875rem", "0.1875rem"],
  ] as const)("outlines %s", (outlines, width, field) => {
    expect(resolveCheckoutTheme({ outlines })).toEqual({
      outlines,
      border_width: width,
      popup_border_width: width,
      button_border_width: width,
      field_border_width: field,
    });
  });

  it("shadows none leaves everything unset", () => {
    expect(resolveCheckoutTheme({ shadows: "none" })).toEqual({
      shadows: "none",
    });
  });

  it("shadows light, medium, heavy", () => {
    const light = resolveCheckoutTheme({ shadows: "light" });
    expect(light).toEqual({
      shadows: "light",
      surface_shadow: "0px 1px 2px 0px #0000000F",
      popup_shadow: "0px 4px 12px 0px #0000001A",
    });
    const medium = resolveCheckoutTheme({ shadows: "medium" });
    expect([
      medium.surface_shadow,
      medium.popup_shadow,
      medium.field_shadow,
      medium.button_shadow,
    ]).toEqual([
      "0px 2px 8px 0px #00000014",
      "0px 8px 24px 0px #0000001F",
      "0px 1px 2px 0px #0000000D",
      "0px 1px 2px 0px #0000001A",
    ]);
    const heavy = resolveCheckoutTheme({ shadows: "heavy" });
    expect([
      heavy.surface_shadow,
      heavy.popup_shadow,
      heavy.field_shadow,
      heavy.button_shadow,
    ]).toEqual([
      "0px 8px 24px 0px #0000001F",
      "0px 16px 40px 0px #00000029",
      "0px 1px 3px 0px #00000014",
      "0px 2px 6px 0px #00000026",
    ]);
  });

  it("shadows sharp uses the Foreground, or #1A1A1A", () => {
    const set = resolveCheckoutTheme({
      shadows: "sharp",
      text_color: "#1C1A17",
    });
    expect([
      set.surface_shadow,
      set.popup_shadow,
      set.field_shadow,
      set.button_shadow,
    ]).toEqual([
      "4px 4px 0px 0px #1C1A17",
      "4px 4px 0px 0px #1C1A17",
      "2px 2px 0px 0px #1C1A17",
      "2px 2px 0px 0px #1C1A17",
    ]);
    expect(resolveCheckoutTheme({ shadows: "sharp" }).field_shadow).toBe(
      "2px 2px 0px 0px #1A1A1A",
    );
  });

  it("shadows sharp switches to a readable ink on a dark page", () => {
    for (const theme of [
      { page_background: "#14120F" },
      { page_background: "#14120F", text_color: "#2A2824" },
    ]) {
      const out = resolveCheckoutTheme({ ...theme, shadows: "sharp" });
      const ink = out.field_shadow!.split(" ").pop()!;
      expect(ratio(ink, "#14120F")).toBeGreaterThanOrEqual(3);
      expect(out.surface_shadow!.endsWith(ink)).toBe(true);
    }
  });

  it("ignores invalid theme-level values", () => {
    const input = {
      corners: "round",
      outlines: "x",
      shadows: "huge",
      page_background: "red",
    } as unknown as CheckoutTheme;
    expect(resolveCheckoutTheme(input)).toEqual(input);
  });

  describe("colors", () => {
    it("lifts a light page toward white and keeps contrast", () => {
      const out = resolveCheckoutTheme({
        page_background: "#F7F4EE",
        text_color: "#1C1A17",
      });
      expect(out.surface_background).toBe("#FDFCFA");
      expect(out.popup_background).toBe(out.surface_background);
      expect(out.field_background).toBe(out.surface_background);
      expect(out.border_color).toMatch(HEX);
      expect(out.popup_border_color).toBe(out.border_color);
      expect(
        ratio(out.field_border_color!, out.surface_background!),
      ).toBeGreaterThanOrEqual(3);
      expect(
        ratio(out.secondary_text_color!, out.surface_background!),
      ).toBeGreaterThanOrEqual(4.5);
      expect(out.error_color).toBeUndefined();
      expect(out.success_color).toBeUndefined();
    });

    it("lifts a dark page to something lighter than the page", () => {
      const out = resolveCheckoutTheme({
        page_background: "#14120F",
        text_color: "#F2EDE4",
      });
      expect(lum(out.surface_background!)).toBeGreaterThan(lum("#14120F"));
      expect(out.surface_background).toBe("#22201D");
      expect(
        ratio(out.field_border_color!, out.surface_background!),
      ).toBeGreaterThanOrEqual(3);
      expect(
        ratio(out.secondary_text_color!, out.surface_background!),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it.each([
      ["#2D216B", "#4DE045"],
      ["#914C36", "#E1FD40"],
    ])(
      "keeps contrast after rounding (%s on %s)",
      (page_background, text_color) => {
        const out = resolveCheckoutTheme({ page_background, text_color });
        expect(
          ratio(out.field_border_color!, out.surface_background!),
        ).toBeGreaterThanOrEqual(3);
        expect(
          ratio(out.secondary_text_color!, out.surface_background!),
        ).toBeGreaterThanOrEqual(4.5);
      },
    );

    it.each([
      [{ page_background: "#14120F" }],
      [{ page_background: "#0B0B0F" }],
      [{ text_color: "#F2F2F2" }],
    ])("keeps both ratios when the Foreground is too faint (%j)", (theme) => {
      const out = resolveCheckoutTheme(theme);
      expect(
        ratio(out.field_border_color!, out.surface_background!),
      ).toBeGreaterThanOrEqual(3);
      expect(
        ratio(out.secondary_text_color!, out.surface_background!),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it("keeps both ratios on the hex outputs for seeded random pairs", () => {
      let seed = 12345;
      const rnd = () =>
        (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
      const color = () =>
        "#" +
        [0, 1, 2]
          .map(() =>
            Math.floor(rnd() * 256)
              .toString(16)
              .padStart(2, "0"),
          )
          .join("")
          .toUpperCase();
      for (let i = 0; i < 600; i++) {
        const page_background = color();
        const text_color = color();
        const out = resolveCheckoutTheme({ page_background, text_color });
        expect(
          ratio(out.field_border_color!, out.surface_background!),
          `${page_background} ${text_color}`,
        ).toBeGreaterThanOrEqual(3);
        expect(
          ratio(out.secondary_text_color!, out.surface_background!),
          `${page_background} ${text_color}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    });

    it("works with only one of the two keys, and composites translucent colors over white", () => {
      expect(
        resolveCheckoutTheme({ text_color: "#202020" }).surface_background,
      ).toMatch(HEX);
      expect(
        resolveCheckoutTheme({ page_background: "#00000000" })
          .surface_background,
      ).toBe("#FFFFFF");
    });
  });

  describe("lower keys", () => {
    const theme = {
      page_background: "#F7F4EE",
      text_color: "#1C1A17",
      corners: "soft",
      outlines: "bold",
      shadows: "heavy",
    } as const;

    it("keeps a valid set value", () => {
      const lower = {
        surface_background: "#ABCDEF80",
        field_border_color: "#123456",
        surface_radius: "2rem",
        control_radius: "pill",
        field_border_width: "0rem",
        popup_shadow: "-40px 40px 80px -40px #AABBCC",
      };
      expect(resolveCheckoutTheme({ ...theme, ...lower })).toMatchObject(lower);
    });

    it.each([
      ["surface_background", "red"],
      ["surface_radius", "big"],
      ["surface_radius", "pill"],
      ["border_width", "0.5 rem"],
      ["surface_shadow", "0px 1px 2.5px 0px #000000"],
      ["border_width", "1px"],
      ["surface_shadow", "0 1px 2px #000"],
      ["button_shadow", null],
    ])("derives an invalid %s (%s)", (key, value) => {
      const out = resolveCheckoutTheme({ ...theme, [key]: value });
      expect(out[key as keyof CheckoutTheme]).toBe(
        resolveCheckoutTheme(theme)[key as keyof CheckoutTheme],
      );
    });

    it.each([
      ["surface_radius", "2.5rem"],
      ["control_radius", "1.5001rem"],
      ["border_width", "0.6rem"],
      ["surface_shadow", "0px 1px 81px 0px #000000"],
      ["popup_shadow", "90px -90px 0px 90px #000000"],
    ])(
      "keeps an out-of-range %s (%s) for the checkout to clamp",
      (key, value) => {
        expect(
          resolveCheckoutTheme({ ...theme, [key]: value })[
            key as keyof CheckoutTheme
          ],
        ).toBe(value);
      },
    );

    it("derives a wrong-format value next to an out-of-range one", () => {
      const out = resolveCheckoutTheme({
        corners: "soft",
        surface_radius: "big",
        popup_radius: "2.5rem",
      });
      expect(out.surface_radius).toBe("1.5rem");
      expect(out.popup_radius).toBe("2.5rem");
    });

    it.each([
      ["surface_radius", "100rem"],
      ["border_width", "100rem"],
      ["surface_shadow", "0px 1px 2px 0px #000000".replace("1px", "1000px")],
      ["popup_shadow", "0px 1px 2px 1000px #000000"],
    ])("derives %s with too many digits (%s)", (key, value) => {
      const out = resolveCheckoutTheme({ ...theme, [key]: value });
      expect(out[key as keyof CheckoutTheme]).toBe(
        resolveCheckoutTheme(theme)[key as keyof CheckoutTheme],
      );
    });

    it("accepts the widest numbers the checkout accepts", () => {
      const lower = {
        surface_radius: "99.9999rem",
        surface_shadow: "-999px 999px 999px -999px #aabbcc",
      };
      expect(resolveCheckoutTheme({ ...theme, ...lower })).toMatchObject(lower);
    });

    it("never fills one lower key from another", () => {
      const out = resolveCheckoutTheme({ surface_radius: "0.75rem" });
      expect(out).toEqual({ surface_radius: "0.75rem" });
      expect(out.popup_radius).toBeUndefined();
      const colors = resolveCheckoutTheme({
        page_background: "#F7F4EE",
        border_color: "#000000",
      });
      expect(colors.border_color).toBe("#000000");
      expect(colors.popup_border_color).not.toBe("#000000");
    });
  });
});
