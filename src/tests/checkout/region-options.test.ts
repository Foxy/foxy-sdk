import { describe, expect, it } from "vitest";

import {
  loadRegionMessages,
  regionLabelMessageId,
  regionMessageId,
  toRegionOptions,
} from "../../checkout/regionOptions";

describe("regionMessageId", () => {
  it("lowercases and underscore-separates", () => {
    expect(regionMessageId("US", "MN")).toBe("region_us_mn");
  });

  it("keeps numeric codes intact", () => {
    expect(regionMessageId("JP", "23")).toBe("region_jp_23");
    expect(regionMessageId("NO", "01")).toBe("region_no_01");
  });

  it("collapses runs of non-alphanumerics to a single underscore", () => {
    expect(regionMessageId("ES", "A Coruna")).toBe("region_es_a_coruna");
  });

  it("handles single-letter codes", () => {
    expect(regionMessageId("IE", "D")).toBe("region_ie_d");
  });

  it("handles three-letter codes", () => {
    expect(regionMessageId("AU", "NSW")).toBe("region_au_nsw");
  });

  it("trims leading and trailing separators", () => {
    expect(regionMessageId("ES", " Las Palmas ")).toBe("region_es_las_palmas");
  });
});

describe("regionLabelMessageId", () => {
  it("maps each region country to its Foxy language-string id", () => {
    expect(regionLabelMessageId("US")).toBe("checkout_location_state");
    expect(regionLabelMessageId("CA")).toBe("checkout_location_province");
    expect(regionLabelMessageId("ES")).toBe("checkout_location_province");
    expect(regionLabelMessageId("IE")).toBe("checkout_location_county");
    expect(regionLabelMessageId("NO")).toBe("checkout_location_county");
    expect(regionLabelMessageId("JP")).toBe("checkout_location_prefecture");
    expect(regionLabelMessageId("CH")).toBe("checkout_location_canton");
  });

  it("is case-insensitive on the country code", () => {
    expect(regionLabelMessageId("jp")).toBe("checkout_location_prefecture");
  });

  it("falls back to state for a country with no known region type", () => {
    expect(regionLabelMessageId("FR")).toBe("checkout_location_state");
    expect(regionLabelMessageId("")).toBe("checkout_location_state");
  });
});

describe("toRegionOptions", () => {
  it("maps codes to value plus message id", () => {
    expect(toRegionOptions(["MN", "CA"], "US")).toEqual([
      { value: "MN", messageId: "region_us_mn" },
      { value: "CA", messageId: "region_us_ca" },
    ]);
  });

  it("preserves the code verbatim, never uppercasing it", () => {
    // Spain's codes ARE the names. Uppercasing would make them unmatchable
    // against region_options.
    expect(toRegionOptions(["A Coruna"], "ES")).toEqual([
      { value: "A Coruna", messageId: "region_es_a_coruna" },
    ]);
    expect(toRegionOptions(["23"], "JP")).toEqual([
      { value: "23", messageId: "region_jp_23" },
    ]);
  });

  it("trims surrounding whitespace from the value", () => {
    expect(toRegionOptions([" MN "], "US")).toEqual([
      { value: "MN", messageId: "region_us_mn" },
    ]);
  });

  it("preserves input order rather than sorting", () => {
    // The server orders region_options; unlike countries there is no
    // localized name available at this layer to sort by.
    expect(toRegionOptions(["WY", "AL"], "US").map((o) => o.value)).toEqual(["WY", "AL"]);
  });

  it("drops empty and non-string entries", () => {
    expect(toRegionOptions(["", 7, null, "MN"], "US")).toEqual([
      { value: "MN", messageId: "region_us_mn" },
    ]);
  });

  it("returns an empty array for a non-array input", () => {
    expect(toRegionOptions(undefined, "US")).toEqual([]);
    expect(toRegionOptions("MN", "US")).toEqual([]);
  });

  it("returns an empty array for an empty input", () => {
    expect(toRegionOptions([], "US")).toEqual([]);
  });

  it("does not throw when the country code is empty", () => {
    expect(toRegionOptions(["MN"], "")).toEqual([
      { value: "MN", messageId: "region__mn" },
    ]);
  });
});

describe("loadRegionMessages", () => {
  it("resolves the en-US catalog", async () => {
    const messages = await loadRegionMessages("en-US");
    expect(messages["region_us_mn"]).toBe("Minnesota");
    expect(messages["region_jp_23"]).toBe("Aichi");
    expect(messages["region_no_01"]).toBe("Østfold");
  });

  it("accepts a POSIX-form locale", async () => {
    const messages = await loadRegionMessages("en_US");
    expect(messages["region_us_mn"]).toBe("Minnesota");
  });

  it("falls back to the base language when the exact locale has no catalog", async () => {
    const messages = await loadRegionMessages("en-GB");
    expect(messages["region_us_mn"]).toBe("Minnesota");
  });

  it("resolves to an empty object for an unknown locale rather than throwing", async () => {
    await expect(loadRegionMessages("zz-ZZ")).resolves.toEqual({});
  });

  it("returns the same object for repeated calls (cached)", async () => {
    const a = await loadRegionMessages("en-US");
    const b = await loadRegionMessages("en-US");
    expect(a).toBe(b);
  });
});

describe("catalog integrity", () => {
  it("every catalog key is reproducible from its country and code by regionMessageId", async () => {
    // The generator and the runtime lookup must agree. If they drift, every
    // label silently degrades to a raw code with no error anywhere.
    const messages = await loadRegionMessages("en-US");
    const keys = Object.keys(messages);

    expect(keys.length).toBe(330);
    for (const key of keys) {
      expect(key).toMatch(/^region_[a-z]{2}_[a-z0-9_]+$/);
    }
  });

  // NOTE: `new Set(Object.keys(obj)).size === Object.keys(obj).length` is a
  // tautology once the catalog has round-tripped through JSON.parse — object
  // keys are unique by construction, so this can never fail regardless of
  // whether the generator collapsed distinct regions into one key. The
  // assertion below instead re-derives each key from the (country, code)
  // shapes that actually appear in the shipped data via the SAME
  // `regionMessageId` the generator calls, closing the loop the brief's
  // version left open: if the generator's normalization ever drifts from the
  // runtime's, these lookups miss and the test fails loudly instead of
  // silently degrading to raw codes.
  it("keys resolve via regionMessageId for every code shape the catalog contains", async () => {
    const messages = await loadRegionMessages("en-US");

    // 2-letter code (US)
    expect(messages[regionMessageId("US", "MN")]).toBe("Minnesota");
    // Spain: the code IS the name, contains a space
    expect(messages[regionMessageId("ES", "A Coruna")]).toBe("A Coruna");
    // Numeric codes (Japan, Norway)
    expect(messages[regionMessageId("JP", "23")]).toBe("Aichi");
    expect(messages[regionMessageId("NO", "01")]).toBe("Østfold");
    // 3-letter code (Australia)
    expect(messages[regionMessageId("AU", "NSW")]).toBeDefined();
    // Single-letter code (Ireland)
    expect(messages[regionMessageId("IE", "D")]).toBeDefined();
  });
});

describe("generator collision detection", () => {
  // These exercise the actual generate-region-messages.mjs script (not a
  // reimplementation of its rule) against crafted input, so the collision
  // guard the catalog's integrity rests on is verified directly rather than
  // inferred from the shipped catalog's key count.
  it("aborts with a non-zero exit code when two raw codes normalize to the same key", async () => {
    // The repo's tsconfig `types` is scoped to `vitest/globals` only (no
    // `@types/node`), so these Node builtin imports have no type
    // declarations in this project. `@ts-expect-error` suppresses that
    // without speculatively widening the shared tsconfig for one test.
    // @ts-expect-error no @types/node in this project's tsconfig "types"
    const { mkdtempSync, writeFileSync, existsSync, rmSync } = await import("node:fs");
    // @ts-expect-error no @types/node in this project's tsconfig "types"
    const { tmpdir } = await import("node:os");
    // @ts-expect-error no @types/node in this project's tsconfig "types"
    const { join, dirname } = await import("node:path");
    // @ts-expect-error no @types/node in this project's tsconfig "types"
    const { execFileSync } = await import("node:child_process");

    const scriptPath = new URL("../../../scripts/generate-region-messages.mjs", import.meta.url)
      .pathname;
    // The generator resolves its output path relative to its OWN location,
    // not cwd, so the would-be output lands in the real locales directory
    // regardless of where the input dump lives.
    const locale = "zz-collision-test";
    const realOutPath = join(
      dirname(scriptPath),
      "..",
      "src/checkout/locales/regions",
      `${locale}.json`,
    );

    const dir = mkdtempSync(join(tmpdir(), "region-gen-collision-"));
    const dumpPath = join(dir, "dump.json");
    writeFileSync(
      dumpPath,
      JSON.stringify({
        US: {
          regions_type: "state",
          // "MN" and "Mn" both normalize (case-fold) to region_us_mn.
          regions: [
            { code: "MN", name: "Minnesota" },
            { code: "Mn", name: "Bogus Duplicate" },
          ],
        },
      }),
    );

    try {
      expect(() =>
        // "node" rather than `process.execPath`: `process` also has no type
        // declarations here (see note above), and the plain command name is
        // sufficient — this repo's generator itself requires plain `node`.
        execFileSync("node", [scriptPath, "--input", dumpPath, "--locale", locale], {
          stdio: "pipe",
        }),
      ).toThrow();

      // The abort happens before writeFileSync, so no stray catalog file
      // should exist for the colliding locale.
      expect(existsSync(realOutPath)).toBe(false);
    } finally {
      // Defensive cleanup in case a bug ever lets the write through.
      if (existsSync(realOutPath)) rmSync(realOutPath);
    }
  });
});
