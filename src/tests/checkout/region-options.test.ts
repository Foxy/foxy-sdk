import { describe, expect, it } from "vitest";

import {
  loadRegionMessages,
  REGION_TYPE_BY_COUNTRY,
  regionLabelMessageId,
  regionMessageId,
  resolveCatalog,
  toRegionOptions,
} from "../../checkout/regionOptions";
import { validateBillingAddressParams } from "../../checkout/v8n";

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

describe("REGION_TYPE_BY_COUNTRY", () => {
  it("is frozen: assigning to it throws rather than silently mutating the shared map", () => {
    // The test file is an ES module, so it already runs in strict mode,
    // where an assignment to a frozen property throws instead of silently
    // no-oping.
    expect(() => {
      // @ts-expect-error intentionally violating the readonly type at runtime
      REGION_TYPE_BY_COUNTRY.US = "county";
    }).toThrow(TypeError);
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

  // `resolveCatalog` is exercised directly (below) with a test-local loader
  // map and cache, so it can never leak a fake locale into the module-level
  // cache `loadRegionMessages` shares with the rest of the app. That means
  // no test proves `loadRegionMessages` itself is actually memoized against
  // a stable, shared cache rather than, say, a wrapper that builds a fresh
  // `new Map()` on every call (which would satisfy every awaited-result
  // assertion above while defeating memoization entirely — Node's own
  // module registry already makes `import()` return the same object
  // identity either way, so awaited equality can't distinguish the two).
  // Comparing the *unawaited* promises is the one assertion that can only
  // pass if both calls hit the same cache entry.
  it("returns the identical in-flight promise for a repeated locale (module-level memoization)", () => {
    expect(loadRegionMessages("en-US")).toBe(loadRegionMessages("en-US"));
  });
});

// These call `resolveCatalog` directly with a test-local loader map and
// cache, so each test can exercise a path the shipped "en-US"-only catalog
// can't reach (a second same-language locale, a rejecting loader, a counted
// loader) without touching `loadRegionMessages`' module-level state at all.
// Nothing here can leak into another test or into a real lookup.
describe("resolveCatalog exact-match resolution", () => {
  it("prefers an exact locale match over a same-language catalog registered earlier", async () => {
    // Insertion order matters for the bug this guards against: es-ES is
    // registered (and therefore iterated) before es-MX.
    const esES = { region_es_provincia: "Provincia (ES)" };
    const esMX = { region_mx_estado: "Estado (MX)" };
    const loaders = {
      "es-ES": () => Promise.resolve({ default: esES }),
      "es-MX": () => Promise.resolve({ default: esMX }),
    };
    const cache = new Map<string, Promise<Record<string, string>>>();

    const messages = await resolveCatalog(loaders, cache, "es-MX");

    expect(messages).toBe(esMX);
  });
});

describe("resolveCatalog failure handling", () => {
  it("resolves to an empty object when the catalog chunk rejects, and does not cache the failure", async () => {
    let calls = 0;
    const loaders = {
      "qb-reject": () => {
        calls += 1;
        return Promise.reject(new Error("simulated chunk load failure"));
      },
    };
    const cache = new Map<string, Promise<Record<string, string>>>();

    const first = await resolveCatalog(loaders, cache, "qb-reject");
    expect(first).toEqual({});
    // A cached failure would mean this locale serves raw codes for the rest
    // of the page's life after one transient error; the entry must be gone.
    expect(cache.has("qb-reject")).toBe(false);

    const second = await resolveCatalog(loaders, cache, "qb-reject");
    expect(second).toEqual({});
    // Proves the failure wasn't cached: the loader ran again rather than
    // returning a memoized rejection-turned-{}.
    expect(calls).toBe(2);
  });
});

describe("resolveCatalog caching", () => {
  // A synthetic, call-counted loader genuinely distinguishes "cached" from
  // "not cached" — unlike a real `import()`, whose result would come back
  // identical from Node/Vite's own module registry regardless of whether
  // this cache is consulted at all.
  it("invokes the loader once and reuses the result for a repeated locale", async () => {
    let calls = 0;
    const payload = { region_qa_memo: "Memo" };
    const loaders = {
      "qa-memo": () => {
        calls += 1;
        return Promise.resolve({ default: payload });
      },
    };
    const cache = new Map<string, Promise<Record<string, string>>>();

    const a = await resolveCatalog(loaders, cache, "qa-memo");
    const b = await resolveCatalog(loaders, cache, "qa-memo");

    expect(a).toBe(b);
    expect(calls).toBe(1);
  });
});

describe("catalog integrity", () => {
  // NOTE: this does not actually reproduce all 330 keys from their raw
  // (country, code) pairs — the shipped catalog is only `key → name`, the
  // raw pairs that produced each key aren't shipped alongside it, so there's
  // nothing here to re-derive them from. It checks catalog size and key
  // shape only; the companion test below ("keys resolve via regionMessageId
  // for every code shape the catalog contains") is what actually closes the
  // loop for a representative code from each shape.
  it("has exactly 330 keys, each shaped region_<country>_<code>", async () => {
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
    const { mkdtempSync, writeFileSync, existsSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const { execFileSync } = await import("node:child_process");

    const scriptPath = fileURLToPath(
      new URL("../../../scripts/generate-region-messages.mjs", import.meta.url),
    );
    // `--out-dir` points the generator at an isolated temp directory so this
    // test can never write into tracked source, even if the abort itself
    // regressed.
    const locale = "zz-collision-test";
    const outDir = mkdtempSync(join(tmpdir(), "region-gen-out-"));
    const outPath = join(outDir, `${locale}.json`);

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
      let caught: unknown;
      try {
        // `process.execPath` rather than the plain command name "node": this
        // guarantees the script runs on the exact same Node binary running
        // this test, not whatever "node" resolves to first on PATH.
        execFileSync(
          process.execPath,
          [scriptPath, "--input", dumpPath, "--locale", locale, "--out-dir", outDir],
          { stdio: "pipe" },
        );
      } catch (error) {
        caught = error;
      }

      expect(caught).toBeDefined();
      const err = caught as { status?: number; stderr?: Buffer | string };
      expect(err.status).toBe(1);
      expect(String(err.stderr)).toMatch(/ABORT/);

      // The abort happens before writeFileSync, so no catalog file should
      // exist in the isolated out-dir for the colliding locale.
      expect(existsSync(outPath)).toBe(false);
    } finally {
      // Defensive cleanup in case a bug ever lets the write through.
      rmSync(dir, { recursive: true, force: true });
      rmSync(outDir, { recursive: true, force: true });
    }
  });
});

describe("generator --out-dir handling", () => {
  it("mentions --out-dir in the usage string", async () => {
    const { fileURLToPath } = await import("node:url");
    const { execFileSync } = await import("node:child_process");

    const scriptPath = fileURLToPath(
      new URL("../../../scripts/generate-region-messages.mjs", import.meta.url),
    );

    let caught: unknown;
    try {
      // No --input at all: this is the "print usage and exit" path.
      execFileSync(process.execPath, [scriptPath], { stdio: "pipe" });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeDefined();
    const err = caught as { status?: number; stderr?: Buffer | string };
    expect(err.status).toBe(2);
    expect(String(err.stderr)).toMatch(/--out-dir/);
  });

  it("errors rather than silently falling back when --out-dir is passed with no value", async () => {
    const { mkdtempSync, writeFileSync, existsSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join, resolve: pathResolve } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const { execFileSync } = await import("node:child_process");

    const scriptPath = fileURLToPath(
      new URL("../../../scripts/generate-region-messages.mjs", import.meta.url),
    );

    const dir = mkdtempSync(join(tmpdir(), "region-gen-outdir-valueless-"));
    const dumpPath = join(dir, "dump.json");
    writeFileSync(
      dumpPath,
      JSON.stringify({
        US: { regions_type: "state", regions: [{ code: "MN", name: "Minnesota" }] },
      }),
    );

    // A locale that can never collide with a real shipped catalog, so that
    // IF the bug this guards against ever regressed, it would land a file
    // under tracked source with an unmistakably-fake, easily-swept-up name
    // rather than colliding with `en-US.json`.
    const locale = "zz-out-dir-valueless-test";
    const trackedFallbackPath = fileURLToPath(
      new URL(`../../checkout/locales/regions/${locale}.json`, import.meta.url),
    );

    try {
      let caught: unknown;
      try {
        // `--out-dir` is the last argv token: `arg()` would read past the
        // end of argv and get `undefined` for its value.
        execFileSync(
          process.execPath,
          [scriptPath, "--input", dumpPath, "--locale", locale, "--out-dir"],
          { stdio: "pipe" },
        );
      } catch (error) {
        caught = error;
      }

      expect(caught).toBeDefined();
      const err = caught as { status?: number; stderr?: Buffer | string };
      expect(err.status).toBe(2);
      expect(String(err.stderr)).toMatch(/--out-dir/);

      // The whole point: a malformed --out-dir must never fall back to
      // writing into tracked source.
      expect(existsSync(trackedFallbackPath)).toBe(false);
      expect(existsSync(pathResolve(dir, `${locale}.json`))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
      // Defensive cleanup in case a bug ever lets the write through.
      rmSync(trackedFallbackPath, { force: true });
    }
  });
});

// Cross-repo seam: the country field's uppercase-versus-case-sensitive-
// allowlist bug survived two review rounds because nothing exercised
// `toRegionOptions` and `validateBillingAddressParams` together — consumer
// tests mock `updateBillingAddress` so the validator never runs, and the SDK
// suite has no consumer. Any value `toRegionOptions` produces from a server
// list must also be accepted by the validator against that same list.
describe("region options and validation agree", () => {
  const display = { required_form_fields: [], hidden_form_fields: [] };

  it("accepts every value toRegionOptions produced from the same list", () => {
    // Whatever the UI can offer, the validator must accept. Spain is the case
    // that breaks if anyone applies the country field's uppercasing here.
    const serverList = ["A Coruna", "Barcelona", "Madrid"];
    const options = toRegionOptions(serverList, "ES");

    for (const option of options) {
      const errors = validateBillingAddressParams({ region: option.value }, display, {
        regionOptions: serverList,
      });
      expect(errors, `region ${option.value} should validate`).toEqual([]);
    }
  });

  it("accepts numeric region codes", () => {
    const serverList = ["23", "01"];
    for (const option of toRegionOptions(serverList, "JP")) {
      expect(
        validateBillingAddressParams({ region: option.value }, display, {
          regionOptions: serverList,
        }),
      ).toEqual([]);
    }
  });

  it("still rejects a region absent from the list", () => {
    const errors = validateBillingAddressParams({ region: "ZZ" }, display, {
      regionOptions: ["MN", "WI"],
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("accepts every value toRegionOptions produced from whitespace-padded server codes", () => {
    // Trim-semantics divergence: toRegionOptions calls .trim() on the value,
    // and the validator also calls .trim(). If either side's trimming ever
    // changes (e.g., non-breaking-space handling), they would disagree and a
    // shopper's valid selection would be rejected. This fixture ensures the
    // cross-repo seam stays synchronized.
    const serverList = ["  MN  ", "WI"];
    const options = toRegionOptions(serverList, "US");

    for (const option of options) {
      const errors = validateBillingAddressParams({ region: option.value }, display, {
        regionOptions: serverList,
      });
      expect(errors, `region ${option.value} should validate`).toEqual([]);
    }
  });
});
