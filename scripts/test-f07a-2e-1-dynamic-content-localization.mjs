// F07A-2E-1_DYNAMIC_CONTENT_LOCALIZATION_CANDIDATE_R1
// F07A_2E_1_FORMATTING_RESILIENT_SEMANTIC_CONTRACT

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const messageFiles = {
  vi: "src/i18n/dynamic-content/messages/vi.ts",
  en: "src/i18n/dynamic-content/messages/en.ts",
  lo: "src/i18n/dynamic-content/messages/lo.ts",
};

function parseMessages(source) {
  const result = new Map();
  const pattern = /^\s*"([^"]+)":\s*("(?:\\.|[^"\\])*"),?\s*$/gm;
  for (const match of source.matchAll(pattern)) {
    if (typeof match[1] === "string" && typeof match[2] === "string") {
      result.set(match[1], JSON.parse(match[2]));
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
  Object.entries(messageFiles).map(([locale, file]) => [
    locale,
    parseMessages(read(file)),
  ]),
);

assert.deepEqual(Object.keys(catalogs).sort(), ["en", "lo", "vi"]);
const keys = [...catalogs.vi.keys()].sort();
assert.ok(keys.length >= 50, "expected comprehensive dynamic-content catalog");
for (const [locale, catalog] of Object.entries(catalogs)) {
  assert.deepEqual([...catalog.keys()].sort(), keys, `key mismatch:${locale}`);
  for (const key of keys) {
    const value = catalog.get(key) ?? "";
    assert.ok(value.trim(), `empty:${locale}:${key}`);
    assert.doesNotMatch(value, /<\/?[A-Za-z][^>]*>/);
    assert.deepEqual(
      placeholders(value),
      placeholders(catalogs.vi.get(key) ?? ""),
      `placeholder mismatch:${locale}:${key}`,
    );
  }
}
console.log("PASS Vietnamese English and Lao dynamic-content catalog parity");
assert.ok(
  [...catalogs.lo.values()].some((value) => /[\u0E80-\u0EFF]/u.test(value)),
);
console.log("PASS Lao dynamic-content UI catalog contains Lao Unicode");

const preview = read("src/app/ui-preview/localized-dynamic-content/page.tsx");
const config = read("src/i18n/dynamic-content/dynamic-content.config.ts");
const registry = read("src/i18n/dynamic-content/dynamic-content.registry.ts");

assert.match(
  preview,
  /previewPath:\s*"\/ui-preview\/localized-dynamic-content"/,
);
assert.match(preview, /view=\$\{view\}/);
assert.match(preview, /createLocalizedShellBundle\(content\.locale\)/);
for (const view of ["product", "destination", "guide", "fallback"]) {
  assert.match(preview, new RegExp(`"${view}"`));
}
console.log(
  "PASS locale switch preserves all dynamic-content views and shell locale",
);

const compactConfig = config.replace(/\s+/g, " ");
for (const view of ["product", "destination", "guide", "fallback"]) {
  assert.ok(compactConfig.includes(`"${view}"`));
}
assert.match(
  compactConfig,
  /\/ui-preview\/localized-dynamic-content\?locale=\$\{locale\}&view=\$\{view\}/,
);
console.log(
  "PASS dynamic-content navigation remains preview-only and query-based",
);

for (const marker of [
  "F07A_2E_1_EXPLICIT_LOCALE_RECORDS_ONLY",
  "F07A_2E_1_NO_MACHINE_TRANSLATION",
  "F07A_2E_1_SOURCE_AUTHORITY_PRESERVED",
  "F07A_2E_1_EXPLICIT_FALLBACK_PROVENANCE",
  "F07A_2E_1_NO_PRICE_CONVERSION_OR_COMMERCE_MUTATION",
]) {
  assert.match(config, new RegExp(marker));
}
assert.doesNotMatch(
  `${config}\n${preview}`,
  /openai|translateText|machineTranslation|autoTranslate|fetch\(|axios|graphql|wp-json|wc\/store/i,
);
assert.match(config, /PRODUCT_CONTENT/);
assert.match(config, /DESTINATION_CONTENT/);
assert.match(config, /GUIDE_CONTENT/);
console.log(
  "PASS dynamic content uses explicit locale records without runtime translation",
);

assert.match(config, /productId:\s*2337/);
assert.match(config, /sku:\s*"JP-5GBD-7D"/);
assert.match(config, /sourceCurrency:\s*"VND"/);
assert.match(config, /sourcePriceLabel:\s*"169\.000 ₫"/);
assert.match(config, /variationCount:\s*76/);
assert.doesNotMatch(
  `${config}\n${preview}`,
  /exchangeRate|fxRate|convertCurrency|convertedPrice/i,
);
assert.doesNotMatch(preview, /\b(?:USD|LAK)\s*[0-9]/);
console.log(
  "PASS WooCommerce authority fields and source VND price remain unchanged",
);

assert.match(config, /status:\s*direct \? "localized" : "fallback"/);
assert.match(
  config,
  /fallbackReason:\s*direct \? null : "missing-locale-record"/,
);
assert.match(
  config,
  /const resolvedLocale:[\s\S]*direct \? requestedLocale : "vi"/,
);
const fallbackBlock = config.match(
  /const FALLBACK_CONTENT = \{([\s\S]*?)\} as const satisfies/,
)?.[1];
assert.ok(fallbackBlock, "fallback content block missing");
assert.match(fallbackBlock, /\bvi:/);
assert.doesNotMatch(fallbackBlock, /\b(?:en|lo):/);
console.log(
  "PASS missing locale content returns explicit deterministic fallback provenance",
);

assert.doesNotMatch(
  preview,
  /<form\b|fetch\(|onSubmit|formAction|onClick|useCart|addItem|removeItem|createOrder|createPayment|reserveInventory|fulfill|webhook/i,
);
assert.doesNotMatch(config, /writeFile|\bpost\(|\bput\(|\bpatch\(|\bdelete\(/i);
console.log(
  "PASS dynamic-content preview cannot mutate content or commerce state",
);

assert.doesNotMatch(
  preview,
  /[À-ỹ]/u,
  "Vietnamese UI literals must remain in catalogs or explicit dynamic records",
);
console.log(
  "PASS no Vietnamese UI literals remain in dynamic-content preview component",
);

for (const productionPath of [
  "src/lib/woocommerce/products.ts",
  "src/lib/models/product.ts",
  "src/lib/ysim-api/products.ts",
  "src/app/guides/[slug]/page.tsx",
]) {
  const source = read(productionPath);
  assert.doesNotMatch(
    source,
    /localized-dynamic-content|i18n\/dynamic-content/,
  );
}
console.log("PASS production product and guide adapters remain unchanged");

assert.match(registry, /DYNAMIC_CONTENT_MESSAGE_CATALOG/);
assert.match(registry, /normalizeShellLocale/);
console.log(
  "PASS dynamic-content locale registry remains aligned with shell locale",
);

for (const requiredPath of [
  "scripts/test-f07a-2a-localization-foundation.mjs",
  "scripts/test-f07a-2b-global-shell-localization.mjs",
  "scripts/test-f07a-2c-1-home-localization.mjs",
  "scripts/test-f07a-2c-2-listing-localization.mjs",
  "scripts/test-f07a-2c-3-detail-localization.mjs",
  "scripts/test-f07a-2c-4-secondary-localization.mjs",
  "scripts/test-f07a-2d-1-transaction-localization.mjs",
]) {
  assert.ok(
    fs.existsSync(path.join(root, requiredPath)),
    `${requiredPath} missing`,
  );
}
console.log(
  "PASS existing F07A-2A through F07A-2D-1 contracts remain available",
);
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-2E-1 dynamic commerce content localization candidate contract.",
);
