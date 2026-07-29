// F07A-2C-3_LOCALIZED_DETAIL_CANDIDATE_R4
// F07A_2C_3_FORMATTING_RESILIENT_CONTRACT
// F07A_2C_3_SEMANTIC_DISABLED_BUTTON_CONTRACT

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const messageFiles = {
  vi: "src/i18n/detail/messages/vi.ts",
  en: "src/i18n/detail/messages/en.ts",
  lo: "src/i18n/detail/messages/lo.ts",
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
  referenceKeys.length >= 65,
  "expected a comprehensive detail catalog",
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
console.log("PASS Vietnamese English and Lao detail catalog parity");

assert.ok(
  [...catalogs.lo.values()].some((value) => /[\u0E80-\u0EFF]/u.test(value)),
);
console.log("PASS Lao detail content contains Lao Unicode");

const preview = read("src/app/ui-preview/localized-details/page.tsx");
const config = read("src/i18n/detail/detail.config.ts");
const registry = read("src/i18n/detail/detail.registry.ts");
const productProduction = read("src/app/esim/[slug]/page.tsx");
const destinationProduction = read("src/app/destinations/[slug]/page.tsx");

assert.match(preview, /previewPath:\s*"\/ui-preview\/localized-details"/);
assert.match(preview, /view=\$\{view\}/);
assert.match(preview, /createLocalizedShellBundle\(detail\.locale\)/);
console.log(
  "PASS locale switch preserves localized detail view and shell locale",
);

const compactConfig = config.replace(/\s+/g, " ");
for (const expected of [
  /localizeShellHref\(\s*`\/esim\/\$\{PRODUCT_FIXTURE\.slug\}`\s*,\s*locale\s*,?\s*\)/,
  /localizeShellHref\(\s*`\/destinations\/\$\{DESTINATION_FIXTURE\.slug\}`\s*,\s*locale\s*,?\s*\)/,
  /localizeShellHref\(\s*"\/esim"\s*,\s*locale\s*,?\s*\)/,
  /localizeShellHref\(\s*"\/destinations"\s*,\s*locale\s*,?\s*\)/,
  /relatedProductHref/,
]) {
  assert.match(compactConfig, expected);
}
console.log("PASS detail internal links use locale-aware routing");

assert.match(config, /F07A_2C_3_NO_CURRENCY_CONVERSION/);
assert.doesNotMatch(
  `${config}
${preview}`,
  /exchangeRate|fxRate|convertCurrency|convertedPrice/i,
);
assert.doesNotMatch(preview, /\b(?:USD|LAK)\s*[0-9]/);
console.log("PASS detail preview does not simulate currency conversion");

assert.match(config, /F07A_2C_3_DYNAMIC_SOURCE_CONTENT_UNCHANGED/);
assert.match(config, /sourceTitle:\s*"eSIM Nhật Bản/);
assert.match(config, /sourceTitle:\s*"Nhật Bản"/);
for (const sourceText of ["eSIM Nhật Bản", "Nhật Bản", "Docomo \/ SoftBank"]) {
  assert.doesNotMatch(
    read("src/i18n/detail/messages/en.ts"),
    new RegExp(sourceText),
  );
  assert.doesNotMatch(
    read("src/i18n/detail/messages/lo.ts"),
    new RegExp(sourceText),
  );
}
console.log(
  "PASS dynamic product and destination source content is not falsely translated",
);

assert.match(config, /F07A_2C_3_NO_CART_OR_INVENTORY_MUTATION/);

function jsxOpeningTags(source, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[\\s\\S]*?>`, "g");
  return [...source.matchAll(pattern)].map((match) => match[0]);
}

function hasBooleanJsxAttribute(openingTag, attributeName) {
  const normalized = openingTag.replace(/\s+/g, " ");
  const pattern = new RegExp(
    `\\b${attributeName}(?:\\s*=\\s*(?:\\{true\\}|"true"|'true'))?(?=\\s|>)`,
  );
  return pattern.test(normalized);
}

const commerceButtons = jsxOpeningTags(preview, "button");
assert.equal(
  commerceButtons.length,
  2,
  "detail preview must expose exactly two non-mutating commerce controls",
);
for (const openingTag of commerceButtons) {
  assert.equal(
    hasBooleanJsxAttribute(openingTag, "disabled"),
    true,
    `commerce button is not disabled: ${openingTag}`,
  );
  assert.doesNotMatch(openingTag, /\bonClick\b|\bformAction\b/);
}
assert.doesNotMatch(
  preview,
  /fetch\(|useCart|addItem|createOrder|reserveInventory/,
);
console.log("PASS detail preview does not mutate cart order or inventory");

assert.doesNotMatch(
  preview,
  /[À-ỹ]/u,
  "Vietnamese detail UI literals must stay in catalogs or source fixtures",
);
console.log(
  "PASS no Vietnamese detail UI literals remain in preview component",
);

assert.match(productProduction, /YSIM_PACKAGE_27_ACTIVATION:product-detail/);
assert.doesNotMatch(productProduction, /localized-details|i18n\/detail/);
assert.match(destinationProduction, /DestinationProductsFallbackPage/);
assert.match(destinationProduction, /loadCatalog/);
assert.doesNotMatch(destinationProduction, /localized-details|i18n\/detail/);
console.log(
  "PASS production product and destination detail routes remain unchanged",
);

assert.match(registry, /DETAIL_MESSAGE_CATALOG/);
assert.match(registry, /normalizeShellLocale/);
console.log("PASS detail locale registry remains aligned with shell locale");

for (const requiredPath of [
  "scripts/test-f07a-2a-localization-foundation.mjs",
  "scripts/test-f07a-2b-global-shell-localization.mjs",
  "scripts/test-f07a-2c-1-home-localization.mjs",
  "scripts/test-f07a-2c-2-listing-localization.mjs",
]) {
  assert.ok(
    fs.existsSync(path.join(root, requiredPath)),
    `${requiredPath} missing`,
  );
}
console.log(
  "PASS existing F07A-2A F07A-2B F07A-2C-1 and F07A-2C-2 contracts remain available",
);
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-2C-3 localized product and destination detail candidate contract.",
);
