// Regenerates the region-name catalogs from Foxy's own region data.
//
// Input: a JSON dump shaped { "<CC>": { regions_type, regions: [{code, name}] } }.
// Two ways to produce it:
//
//   1. From the local docker env's PHP location data (offline, deterministic):
//      php -r '$l = include "v/2.0.0/locations/english.inc.php"; $o=[];
//        foreach($l as $cc=>$c){ $r=$c["r"]["options"]??[]; if(!count($r)) continue;
//          $x=[]; foreach($r as $e){ $x[]=["code"=>(string)$e["c"],"name"=>$e["n"]]; }
//          $o[$cc]=["regions_type"=>$c["r"]["lang"],"regions"=>$x]; }
//        echo json_encode($o);' > /tmp/regions-dump.json
//      (run from foxy-docker-env-build/src/foxy)
//
//   2. From the hypermedia API: GET /property_helpers/countries?include_regions=true
//      and reshape `values` the same way.
//
// Usage: node scripts/generate-region-messages.mjs --input /tmp/regions-dump.json --locale en-US [--out-dir <dir>]
//
// --out-dir defaults to src/checkout/locales/regions/ (the shipped catalog
// location). Tests pass a temp directory so a run never writes into tracked
// source.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { REGION_TYPE_BY_COUNTRY, regionMessageId } from "../src/checkout/regionOptions.ts";

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

const usage =
  "usage: node scripts/generate-region-messages.mjs --input <dump.json> [--locale en-US] [--out-dir <dir>]";

const inputPath = arg("input");
const locale = arg("locale", "en-US");
if (!inputPath) {
  console.error(usage);
  process.exit(2);
}

// `arg()` returns `undefined` both when `--out-dir` is absent AND when it is
// present but has no following value (e.g. it's the last argv token, or
// immediately followed by another flag). The former is fine — it means "use
// the default". The latter must be an error: silently falling back to the
// default would mean a malformed `--out-dir` writes into tracked source
// (`src/checkout/locales/regions/`) instead of failing loudly.
const outDirIndex = process.argv.indexOf("--out-dir");
const outDirGiven = outDirIndex !== -1;
const outDirValue = outDirIndex === -1 ? undefined : process.argv[outDirIndex + 1];
if (outDirGiven && (outDirValue === undefined || outDirValue.startsWith("--"))) {
  console.error(`--out-dir requires a value\n${usage}`);
  process.exit(2);
}
const outDir = outDirValue;

const dump = JSON.parse(readFileSync(inputPath, "utf8"));
const catalog = {};
const collisions = [];

for (const [countryCode, country] of Object.entries(dump)) {
  for (const region of country.regions ?? []) {
    // Same function the runtime uses — this import is the whole point.
    const key = regionMessageId(countryCode, region.code);
    if (key in catalog) collisions.push(`${key} (${countryCode}/${region.code})`);
    catalog[key] = region.name;
  }

  const expectedType = REGION_TYPE_BY_COUNTRY[countryCode.toUpperCase()];
  if (country.regions_type && expectedType && country.regions_type !== expectedType) {
    console.warn(
      `warning: ${countryCode} regions_type is "${country.regions_type}" but ` +
        `REGION_TYPE_BY_COUNTRY says "${expectedType}" — update the map in regionOptions.ts`,
    );
  }
  if (country.regions?.length && !expectedType) {
    console.warn(`warning: ${countryCode} has regions but is missing from REGION_TYPE_BY_COUNTRY`);
  }
}

if (collisions.length) {
  console.error(`ABORT: ${collisions.length} key collision(s):\n  ${collisions.join("\n  ")}`);
  process.exit(1);
}

const sorted = Object.fromEntries(Object.entries(catalog).sort(([a], [b]) => a.localeCompare(b)));
const outPath = outDir
  ? resolve(outDir, `${locale}.json`)
  : resolve(import.meta.dirname, `../src/checkout/locales/regions/${locale}.json`);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(sorted, null, 2)}\n`);

console.log(`wrote ${outPath}: ${Object.keys(sorted).length} messages`);
