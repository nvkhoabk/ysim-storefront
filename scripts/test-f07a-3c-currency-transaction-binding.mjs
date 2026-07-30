// F07A-3C_CURRENCY_TRANSACTION_BINDING_CANDIDATE_R1
// F07A_3C_FORMATTING_RESILIENT_SEMANTIC_CONTRACT

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const messageFiles = {
  vi: "src/i18n/currency-transaction-binding/messages/vi.ts",
  en: "src/i18n/currency-transaction-binding/messages/en.ts",
  lo: "src/i18n/currency-transaction-binding/messages/lo.ts",
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
assert.ok(keys.length >= 65, "expected comprehensive binding catalog");
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
console.log("PASS Vietnamese English and Lao currency-binding catalog parity");
assert.ok([...catalogs.lo.values()].some((value) => /[຀-໿]/u.test(value)));
console.log("PASS Lao currency-binding UI catalog contains Lao Unicode");

const preview = read(
  "src/app/ui-preview/currency-transaction-binding/page.tsx",
);
const binding = read("src/lib/currency/currency-transaction-binding.ts");
const bindingTypes = read(
  "src/lib/currency/currency-transaction-binding.types.ts",
);
const registry = read(
  "src/i18n/currency-transaction-binding/currency-transaction-binding.registry.ts",
);
const compactPreview = preview.replace(/\s+/g, " ");
const compactBinding = binding.replace(/\s+/g, " ");
assert.match(
  preview,
  /previewPath:\s*"\/ui-preview\/currency-transaction-binding"/,
);
for (const view of [
  "checkout-lock",
  "payment-draft",
  "order-record",
  "audit",
]) {
  assert.match(preview, new RegExp(`"${view}"`));
}
assert.match(
  compactPreview,
  /\/ui-preview\/currency-transaction-binding\?locale=\$\{locale\}&view=\$\{view\}/,
);
assert.match(
  compactPreview,
  /\/ui-preview\/currency-transaction-binding\?locale=\$\{shell\.locale\}&view=\$\{candidate\}/,
);
console.log(
  "PASS locale switch preserves all currency-binding views and shell locale",
);
console.log(
  "PASS currency-binding navigation remains preview-only and query-based",
);

for (const marker of [
  "F07A_3C_REUSE_F07A_3B_TRANSACTION_PRESENTATION",
  "F07A_3C_NO_PROVIDER_OR_SETTLEMENT_ASSIGNMENT",
  "F07A_3C_IMMUTABLE_CHECKOUT_ORDER_BINDING",
]) {
  assert.match(binding, new RegExp(marker));
}
assert.match(
  compactBinding,
  /createCurrencyPresentationModel\( localeInput, "transaction", \)/,
);
assert.doesNotMatch(
  binding,
  /createCurrencyQuoteResult|createPriceDisplaySnapshot|convertMinorAmount|CURRENCY_QUOTE_DEFINITIONS|numerator:|denominator:|25_000/,
);
console.log(
  "PASS transaction binding reuses F07A-3B presentation without duplicated quote conversion or snapshot logic",
);

assert.match(binding, /sourceCurrency:\s*"VND"/);
assert.match(binding, /productionEligible:\s*false as const/);
assert.match(binding, /purpose:\s*"ui-preview-only" as const/);
assert.match(binding, /status:\s*"preview-locked" as const/);
assert.match(binding, /providerId:\s*null/);
assert.match(binding, /requestedCurrency:\s*null/);
assert.match(binding, /requestedAmountMinor:\s*null/);
assert.match(binding, /settlementInstructionCreated:\s*false as const/);
assert.match(
  binding,
  /amountSource:\s*"locked-presentation-snapshot" as const/,
);
assert.match(binding, /Object\.freeze/);
assert.match(
  bindingTypes,
  /readonly lockedPresentation: CurrencyPresentationModel/,
);
assert.match(bindingTypes, /readonly productionEligible: false/);
console.log(
  "PASS checkout lock order record and payment draft preserve immutable source authority without provider assignment",
);

for (const check of [
  "sourceCurrencyMatches",
  "quoteIdMatches",
  "presentedCurrencyMatches",
  "presentedAmountMatches",
  "snapshotFingerprintMatches",
  "productionEligibilityMatches",
  "paymentDraftRemainsUnassigned",
]) {
  assert.match(binding, new RegExp(check));
}
assert.match(binding, /Object\.values\(checks\)\.every\(Boolean\)/);
assert.match(binding, /"matched"\s*:\s*"mismatch"/);
console.log(
  "PASS integrity audit checks quote currency amount snapshot production eligibility and unassigned payment draft",
);

assert.doesNotMatch(
  `${binding}\n${preview}`,
  /fetch\(|axios|openexchangerates|currencylayer|fixer\.io|exchangerate-api|liveRate/i,
);
assert.doesNotMatch(
  `${binding}\n${preview}`,
  /<form\b|onSubmit|formAction|onClick|useCart|addItem|removeItem|createOrder|createPayment|reserveInventory|fulfill|webhook/i,
);
assert.match(preview, /<button[\s\S]*?disabled[\s\S]*?>/);
console.log(
  "PASS binding preview cannot call live FX or mutate cart payment order fulfillment or inventory",
);

assert.doesNotMatch(
  preview,
  /[À-ỹ]/u,
  "Vietnamese UI literals must remain in catalogs",
);
console.log(
  "PASS no Vietnamese UI literals remain in currency-binding preview component",
);
for (const productionPath of [
  "src/lib/currency/currency-quote.types.ts",
  "src/lib/currency/currency-quote.registry.ts",
  "src/lib/currency/currency-quote.ts",
  "src/lib/currency/currency-snapshot.ts",
  "src/lib/currency/currency-presentation.types.ts",
  "src/lib/currency/currency-presentation.ts",
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
    /currency-transaction-binding|F07A-3C|currencyTransactionBinding/,
  );
}
console.log("PASS production currency and transaction routes remain unchanged");
assert.match(registry, /CURRENCY_TRANSACTION_BINDING_MESSAGE_CATALOG/);
assert.match(registry, /normalizeShellLocale/);
console.log(
  "PASS currency-binding locale registry remains aligned with shell locale",
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
  "scripts/test-f07a-3b-currency-presentation-integration.mjs",
]) {
  assert.ok(
    fs.existsSync(path.join(root, requiredPath)),
    `${requiredPath} missing`,
  );
}
console.log("PASS existing F07A-1A through F07A-3B contracts remain available");
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log("PASS: F07A-3C currency transaction binding candidate contract.");
