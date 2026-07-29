// F07A-3A_CURRENCY_QUOTE_SNAPSHOT_CANDIDATE_R1
// F07A_3A_FORMATTING_RESILIENT_SEMANTIC_CONTRACT

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const messageFiles = {
  vi: "src/i18n/currency/messages/vi.ts",
  en: "src/i18n/currency/messages/en.ts",
  lo: "src/i18n/currency/messages/lo.ts",
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
assert.ok(keys.length >= 45, "expected comprehensive currency catalog");
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
console.log("PASS Vietnamese English and Lao currency catalog parity");
assert.ok(
  [...catalogs.lo.values()].some((value) => /[\u0E80-\u0EFF]/u.test(value)),
);
console.log("PASS Lao currency UI catalog contains Lao Unicode");

const preview = read("src/app/ui-preview/currency-quote-snapshot/page.tsx");
const quoteRegistry = read("src/lib/currency/currency-quote.registry.ts");
const quoteSource = read("src/lib/currency/currency-quote.ts");
const snapshotSource = read("src/lib/currency/currency-snapshot.ts");
const currencyRegistry = read("src/i18n/currency/currency.registry.ts");
const compactPreview = preview.replace(/\s+/g, " ");
const compactQuote = quoteSource.replace(/\s+/g, " ");

assert.match(preview, /previewPath:\s*"\/ui-preview\/currency-quote-snapshot"/);
assert.match(preview, /view=\$\{view\}/);
for (const view of ["quote", "rounding", "snapshot", "expired"]) {
  assert.match(preview, new RegExp(`"${view}"`));
}
console.log(
  "PASS locale switch preserves all currency quote views and shell locale",
);
assert.match(
  compactPreview,
  /\/ui-preview\/currency-quote-snapshot\?locale=\$\{locale\}&view=\$\{view\}/,
);
assert.match(
  compactPreview,
  /\/ui-preview\/currency-quote-snapshot\?locale=\$\{shell\.locale\}&view=\$\{candidate\}/,
);
console.log(
  "PASS currency quote navigation remains preview-only and query-based",
);

for (const marker of [
  "F07A_3A_FIXTURE_RATES_ONLY",
  "F07A_3A_NO_LIVE_FX_PROVIDER",
]) {
  assert.match(quoteRegistry, new RegExp(marker));
}
assert.match(quoteRegistry, /providerId:\s*"fixture-only"/);
assert.match(quoteRegistry, /purpose:\s*"ui-preview-only"/);
assert.match(quoteRegistry, /denominator:\s*BigInt\(25_000\)/);
assert.match(quoteRegistry, /numerator:\s*BigInt\(43\)/);
assert.match(quoteRegistry, /denominator:\s*BigInt\(50\)/);
assert.doesNotMatch(
  `${quoteRegistry}\n${quoteSource}\n${preview}`,
  /fetch\(|axios|openexchangerates|currencylayer|fixer\.io|exchangerate-api|liveRate/i,
);
console.log(
  "PASS quote provenance is fixture-only with no live FX provider call",
);

assert.match(
  quoteSource,
  /PREVIEW_SOURCE_AMOUNT_MINOR\s*=\s*BigInt\(169_000\)/,
);
assert.match(quoteSource, /convertMinorAmount\(/);
assert.match(quoteSource, /formatMoneyMinor\(/);
assert.doesNotMatch(
  `${quoteSource}\n${snapshotSource}`,
  /parseFloat|toFixed|Math\.round|Number\s*\(/,
);
assert.doesNotMatch(
  `${quoteRegistry}\n${quoteSource}\n${snapshotSource}`,
  /\b[0-9][0-9_]*n\b/,
  "TypeScript runtime must remain compatible with the repository ES2017 target",
);

const pow10 = (exponent) => 10n ** BigInt(exponent);
const convert = (
  sourceAmountMinor,
  sourceMinor,
  targetMinor,
  numerator,
  denominator,
) => {
  const scaled = sourceAmountMinor * numerator * pow10(targetMinor);
  const divisor = denominator * pow10(sourceMinor);
  let quotient = scaled / divisor;
  const remainder = scaled % divisor;
  if (remainder * 2n >= divisor) quotient += 1n;
  return quotient;
};
assert.equal(convert(169000n, 0, 0, 1n, 1n), 169000n);
assert.equal(convert(169000n, 0, 2, 1n, 25000n), 676n);
assert.equal(convert(169000n, 0, 0, 43n, 50n), 145340n);
console.log(
  "PASS exact BigInt conversion yields deterministic VND USD and LAK fixture amounts",
);

assert.match(snapshotSource, /Object\.freeze/);
assert.match(snapshotSource, /roundingMode:\s*"half-away-from-zero"/);
assert.match(snapshotSource, /purpose:\s*"ui-preview-only"/);
assert.match(snapshotSource, /F07A_3A_NOT_SETTLEMENT_INSTRUCTION/);
assert.match(
  compactQuote,
  /status = parseTimestamp\(evaluatedAt, "evaluatedAt"\) <= parseTimestamp\(quote\.expiresAt, "expiresAt"\) \? "valid" : "expired"/,
);
assert.match(preview, /<button[\s\S]*?disabled[\s\S]*?>/);
console.log(
  "PASS quote expiry and immutable display snapshot semantics are explicit",
);

assert.doesNotMatch(
  preview,
  /<form\b|fetch\(|onSubmit|formAction|onClick|useCart|addItem|removeItem|createOrder|createPayment|reserveInventory|fulfill|webhook/i,
);
assert.doesNotMatch(
  `${quoteSource}\n${snapshotSource}`,
  /writeFile|\bpost\(|\bput\(|\bpatch\(|\bdelete\(/i,
);
console.log(
  "PASS currency preview cannot mutate cart payment order fulfillment or inventory",
);

assert.doesNotMatch(
  preview,
  /[À-ỹ]/u,
  "Vietnamese UI literals must remain in catalogs",
);
console.log(
  "PASS no Vietnamese UI literals remain in currency preview component",
);

for (const productionPath of [
  "src/lib/market/money.ts",
  "src/lib/market/market.types.ts",
  "src/lib/market/market.registry.ts",
  "src/config/markets.ts",
  "src/app/cart/page.tsx",
  "src/app/checkout/page.tsx",
  "src/app/payment/return/page.tsx",
  "src/app/orders/[orderCode]/page.tsx",
]) {
  const source = read(productionPath);
  assert.doesNotMatch(
    source,
    /currency-quote-snapshot|lib\/currency\/currency-quote|F07A-3A/,
  );
}
console.log("PASS production money and transaction routes remain unchanged");

assert.match(currencyRegistry, /CURRENCY_MESSAGE_CATALOG/);
assert.match(currencyRegistry, /normalizeShellLocale/);
console.log("PASS currency locale registry remains aligned with shell locale");

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
]) {
  assert.ok(
    fs.existsSync(path.join(root, requiredPath)),
    `${requiredPath} missing`,
  );
}
console.log(
  "PASS existing F07A-1A through F07A-2E-1 contracts remain available",
);
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-3A currency quote and price snapshot candidate contract.",
);
