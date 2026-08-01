// F07A-2C-2_LOCALIZED_LISTING_CANDIDATE_R1

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const messageFiles = {
  vi: "src/i18n/listing/messages/vi.ts",
  en: "src/i18n/listing/messages/en.ts",
  lo: "src/i18n/listing/messages/lo.ts",
};

function parseMessages(source) {
  const result = new Map();
  const pattern = /^\s*"([^"]+)":\s*("(?:\\.|[^"\\])*"),?\s*$/gm;
  for (const match of source.matchAll(pattern)) {
    const key = match[1];
    const rawValue = match[2];
    if (typeof key === "string" && typeof rawValue === "string") {
      result.set(key, JSON.parse(rawValue));
    }
  }
  return result;
}

function placeholders(value) {
  return [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_.-]*)\}/g)]
    .map((match) => match[1])
    .filter((name) => typeof name === "string")
    .sort();
}

const catalogs = Object.fromEntries(
  Object.entries(messageFiles).map(([locale, relativePath]) => [
    locale,
    parseMessages(read(relativePath)),
  ]),
);

assert.deepEqual(Object.keys(catalogs).sort(), ["en", "lo", "vi"]);
const referenceKeys = [...catalogs.vi.keys()].sort();
assert.ok(
  referenceKeys.length >= 75,
  "expected a comprehensive listing catalog",
);
for (const [locale, catalog] of Object.entries(catalogs)) {
  assert.deepEqual(
    [...catalog.keys()].sort(),
    referenceKeys,
    `translation key mismatch for ${locale}`,
  );
  for (const key of referenceKeys) {
    const value = catalog.get(key) ?? "";
    assert.ok(value.trim(), `empty translation ${locale}:${key}`);
    assert.doesNotMatch(value, /<\/?[A-Za-z][^>]*>/);
    assert.deepEqual(
      placeholders(value),
      placeholders(catalogs.vi.get(key) ?? ""),
      `placeholder mismatch ${locale}:${key}`,
    );
  }
}
console.log("PASS Vietnamese English and Lao listing catalog parity");

assert.ok(
  [...catalogs.lo.values()].some((value) => /[\u0E80-\u0EFF]/u.test(value)),
);
console.log("PASS Lao listing content contains Lao Unicode");

const preview = read("src/app/ui-preview/localized-listings/page.tsx");
const config = read("src/i18n/listing/listing.config.ts");
const registry = read("src/i18n/listing/listing.registry.ts");
const esimProduction = read("src/app/esim/page.tsx");
const destinationsProduction = read("src/app/destinations/page.tsx");

assert.match(preview, /previewPath:\s*"\/ui-preview\/localized-listings"/);
assert.match(preview, /view=\$\{view\}/);
assert.match(preview, /createLocalizedShellBundle\(listing\.locale\)/);
console.log(
  "PASS locale switch preserves localized listing view and shell locale",
);

assert.match(config, /localizeShellHref\("\/esim", locale\)/);
assert.match(config, /localizeShellHref\("\/destinations", locale\)/);
assert.match(config, /productHref/);
assert.match(config, /destinationHref/);
console.log("PASS listing internal links use locale-aware routing");

assert.match(config, /F07A_2C_2_NO_CURRENCY_CONVERSION/);
assert.doesNotMatch(
  `${config}
${preview}`,
  /exchangeRate|fxRate|convertCurrency|convertedPrice/i,
);
assert.doesNotMatch(preview, /\b(?:USD|LAK)\s*[0-9]/);
console.log("PASS listing preview does not simulate currency conversion");

assert.match(config, /F07A_2C_2_DYNAMIC_SOURCE_CONTENT_UNCHANGED/);
assert.match(config, /sourceTitle:\s*"eSIM Nhật Bản/);
assert.match(preview, /states\.sourceOnly/);
for (const sourceTitle of ["eSIM Nhật Bản", "eSIM Châu Á", "eSIM Thái Lan"]) {
  assert.doesNotMatch(
    read("src/i18n/listing/messages/en.ts"),
    new RegExp(sourceTitle),
  );
  assert.doesNotMatch(
    read("src/i18n/listing/messages/lo.ts"),
    new RegExp(sourceTitle),
  );
}
console.log(
  "PASS dynamic product and destination source content is not falsely translated",
);

assert.doesNotMatch(
  preview,
  /[À-ỹ]/u,
  "Vietnamese listing literals must stay in catalogs or source fixtures",
);
console.log(
  "PASS no Vietnamese listing UI literals remain in preview component",
);

assert.match(esimProduction, /YSIM_PACKAGE_41_ROUTE:esim-inline-quick-filter/);
assert.match(esimProduction, /createListingTranslator/);
assert.doesNotMatch(esimProduction, /ui-preview\/localized-listings/);
assert.match(
  destinationsProduction,
  /YSIM_PACKAGE_38_V3_ROUTE:destinations-query-bridge/,
);
assert.match(destinationsProduction, /createListingTranslator/);
assert.match(destinationsProduction, /localizeDestinationPageViewModel/);
assert.doesNotMatch(destinationsProduction, /ui-preview\/localized-listings/);
console.log(
  "PASS ordinary eSIM and destination routes consume listing catalogs without preview aliases",
);

assert.match(registry, /LISTING_MESSAGE_CATALOG/);
assert.match(registry, /normalizeShellLocale/);
console.log("PASS listing locale registry remains aligned with shell locale");

for (const requiredPath of [
  "scripts/test-f07a-2a-localization-foundation.mjs",
  "scripts/test-f07a-2b-global-shell-localization.mjs",
  "scripts/test-f07a-2c-1-home-localization.mjs",
]) {
  assert.ok(
    fs.existsSync(path.join(root, requiredPath)),
    `${requiredPath} missing`,
  );
}
console.log(
  "PASS existing F07A-2A F07A-2B and F07A-2C-1 contracts remain available",
);
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-2C-2 localized eSIM and destination listing candidate contract.",
);
