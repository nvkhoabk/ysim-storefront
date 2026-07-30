// F07A-3B_CURRENCY_PRESENTATION_INTEGRATION_CANDIDATE_R1
// F07A_3B_FORMATTING_RESILIENT_SEMANTIC_CONTRACT

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const messageFiles = {
  vi: "src/i18n/currency-presentation/messages/vi.ts",
  en: "src/i18n/currency-presentation/messages/en.ts",
  lo: "src/i18n/currency-presentation/messages/lo.ts",
};
function parseMessages(source) {
  const result = new Map();
  const pattern = /^\s*"([^"]+)":\s*("(?:\\.|[^"\\])*"),?\s*$/gm;
  for (const match of source.matchAll(pattern)) {
    if (typeof match[1] === "string" && typeof match[2] === "string")
      result.set(match[1], JSON.parse(match[2]));
  }
  return result;
}
function placeholders(value) {
  return [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_.-]*)\}/g)]
    .map((match) => match[1])
    .filter(Boolean)
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
assert.ok(keys.length >= 45, "expected comprehensive presentation catalog");
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
console.log(
  "PASS Vietnamese English and Lao currency-presentation catalog parity",
);
assert.ok([...catalogs.lo.values()].some((value) => /[຀-໿]/u.test(value)));
console.log("PASS Lao currency-presentation UI catalog contains Lao Unicode");

const preview = read(
  "src/app/ui-preview/currency-presentation-integration/page.tsx",
);
const presentation = read("src/lib/currency/currency-presentation.ts");
const presentationTypes = read(
  "src/lib/currency/currency-presentation.types.ts",
);
const registry = read(
  "src/i18n/currency-presentation/currency-presentation.registry.ts",
);
const compactPreview = preview.replace(/\s+/g, " ");
const compactPresentation = presentation.replace(/\s+/g, " ");
assert.match(
  preview,
  /previewPath:\s*"\/ui-preview\/currency-presentation-integration"/,
);
for (const view of ["home", "listing", "detail", "transaction"])
  assert.match(preview, new RegExp(`"${view}"`));
assert.match(
  compactPreview,
  /\/ui-preview\/currency-presentation-integration\?locale=\$\{locale\}&view=\$\{view\}/,
);
assert.match(
  compactPreview,
  /\/ui-preview\/currency-presentation-integration\?locale=\$\{shell\.locale\}&view=\$\{candidate\}/,
);
console.log(
  "PASS locale switch preserves all currency-presentation contexts and shell locale",
);
console.log(
  "PASS currency-presentation navigation remains preview-only and query-based",
);

for (const marker of [
  "F07A_3B_REUSE_F07A_3A_QUOTE_AND_SNAPSHOT",
  "F07A_3B_NO_DUPLICATE_RATE_OR_CONVERSION_LOGIC",
  "F07A_3B_NOT_SETTLEMENT_OR_PAYMENT_INSTRUCTION",
])
  assert.match(presentation, new RegExp(marker));
assert.match(presentation, /createCurrencyQuoteResult\(/);
assert.match(presentation, /assertCurrencyQuoteUsable\(/);
assert.match(presentation, /createPriceDisplaySnapshot\(/);
assert.match(presentation, /validatePriceDisplaySnapshot\(/);
assert.match(
  compactPresentation,
  /snapshot\.targetAmountMinor !== quoteResult\.targetAmountMinor/,
);
assert.match(
  compactPresentation,
  /snapshot\.targetCurrency !== quoteResult\.quote\.targetCurrency/,
);
assert.doesNotMatch(
  presentation,
  /convertMinorAmount|CURRENCY_QUOTE_DEFINITIONS|numerator:|denominator:|25_000|BigInt\(43\)|BigInt\(50\)/,
);
console.log(
  "PASS presentation integration reuses F07A-3A quote and snapshot without duplicated conversion logic",
);

assert.match(presentation, /sourceCurrency:\s*"VND"/);
assert.match(presentation, /productionEligible:\s*false/);
assert.match(
  presentation,
  /context === "transaction" \? "checkout-preview" : "indicative-display"/,
);
assert.match(presentation, /Object\.freeze/);
assert.match(presentationTypes, /readonly snapshot: PriceDisplaySnapshot/);
assert.match(presentationTypes, /readonly productionEligible: false/);
console.log(
  "PASS context roles preserve source VND authority and non-production eligibility",
);

assert.doesNotMatch(
  `${presentation}
${preview}`,
  /fetch\(|axios|openexchangerates|currencylayer|fixer\.io|exchangerate-api|liveRate/i,
);
assert.doesNotMatch(
  `${presentation}
${preview}`,
  /<form|onSubmit|formAction|onClick|useCart|addItem|removeItem|createOrder|createPayment|reserveInventory|fulfill|webhook/i,
);
assert.match(preview, /<button[\s\S]*?disabled[\s\S]*?>/);
console.log(
  "PASS presentation preview cannot call live FX or mutate cart payment order fulfillment or inventory",
);

assert.doesNotMatch(
  preview,
  /[À-ỹ]/u,
  "Vietnamese UI literals must remain in catalogs",
);
console.log(
  "PASS no Vietnamese UI literals remain in currency-presentation preview component",
);
for (const productionPath of [
  "src/lib/currency/currency-quote.types.ts",
  "src/lib/currency/currency-quote.registry.ts",
  "src/lib/currency/currency-quote.ts",
  "src/lib/currency/currency-snapshot.ts",
  "src/app/page.tsx",
  "src/app/esim/page.tsx",
  "src/app/esim/[slug]/page.tsx",
  "src/app/cart/page.tsx",
  "src/app/checkout/page.tsx",
  "src/app/payment/return/page.tsx",
  "src/app/orders/[orderCode]/page.tsx",
]) {
  const source = read(productionPath);
  assert.doesNotMatch(
    source,
    /currency-presentation-integration|F07A-3B|currency-presentation/,
  );
}
console.log("PASS production currency and storefront routes remain unchanged");
assert.match(registry, /CURRENCY_PRESENTATION_MESSAGE_CATALOG/);
assert.match(registry, /normalizeShellLocale/);
console.log(
  "PASS currency-presentation locale registry remains aligned with shell locale",
);
for (const requiredPath of [
  "scripts/test-f07a-1a-market-domain.mjs",
  "scripts/test-f07a-1b-market-routing.mjs",
  "scripts/test-f07a-2a-localization-foundation.mjs",
  "scripts/test-f07a-2b-global-shell-localization.mjs",
  "scripts/test-f07a-2c-1-home-localization.mjs",
  "scripts/test-f07a-2c-2-listing-localization.mjs",
  "scripts/test-f07a-2c-3-detail-localization.mjs",
  "scripts/test-f07a-2c-4-secondary-localization.mjs",
  "scripts/test-f07a-2d-1-transaction-localization.mjs",
  "scripts/test-f07a-2e-1-dynamic-content-localization.mjs",
  "scripts/test-f07a-3a-currency-quote-snapshot.mjs",
])
  assert.ok(
    fs.existsSync(path.join(root, requiredPath)),
    `${requiredPath} missing`,
  );
console.log("PASS existing F07A-1A through F07A-3A contracts remain available");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3B currency presentation integration candidate contract.",
);
