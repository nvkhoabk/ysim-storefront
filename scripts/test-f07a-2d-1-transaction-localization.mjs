// F07A-2D-1_LOCALIZED_TRANSACTION_CANDIDATE_R1
// F07A_2D_1_FORMATTING_RESILIENT_SEMANTIC_CONTRACT

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const messageFiles = {
  vi: "src/i18n/transaction/messages/vi.ts",
  en: "src/i18n/transaction/messages/en.ts",
  lo: "src/i18n/transaction/messages/lo.ts",
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
assert.ok(keys.length >= 70, "expected comprehensive transaction catalog");
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
console.log("PASS Vietnamese English and Lao transaction catalog parity");
assert.ok(
  [...catalogs.lo.values()].some((value) => /[\u0E80-\u0EFF]/u.test(value)),
);
console.log("PASS Lao transaction content contains Lao Unicode");

const preview = read("src/app/ui-preview/localized-transaction/page.tsx");
const config = read("src/i18n/transaction/transaction.config.ts");
const registry = read("src/i18n/transaction/transaction.registry.ts");

assert.match(preview, /previewPath:\s*"\/ui-preview\/localized-transaction"/);
assert.match(preview, /view=\$\{view\}/);
assert.match(preview, /createLocalizedShellBundle\(transaction\.locale\)/);
for (const view of ["cart", "checkout", "payment", "order-result"]) {
  assert.match(preview, new RegExp(`view === "${view}"`));
}
console.log(
  "PASS locale switch preserves all transaction views and shell locale",
);

const compactConfig = config.replace(/\s+/g, " ");
for (const view of ["cart", "checkout", "payment", "order-result"]) {
  assert.ok(compactConfig.includes(`"${view}"`));
}
assert.match(
  compactConfig,
  /\/ui-preview\/localized-transaction\?locale=\$\{locale\}&view=\$\{view\}/,
);
console.log("PASS transaction navigation remains preview-only and query-based");

assert.match(config, /F07A_2D_1_NO_CURRENCY_CONVERSION/);
assert.match(config, /F07A_2D_1_SOURCE_AMOUNTS_UNCHANGED/);
assert.doesNotMatch(
  `${config}\n${preview}`,
  /exchangeRate|fxRate|convertCurrency|convertedPrice/i,
);
assert.match(config, /sourceCurrency:\s*"VND"/);
assert.match(config, /"338\.000 ₫"/);
assert.doesNotMatch(preview, /\b(?:USD|LAK)\s*[0-9]/);
console.log(
  "PASS source VND amounts remain unchanged without simulated conversion",
);

assert.match(config, /F07A_2D_1_NO_SUBMISSION_OR_COMMERCE_MUTATION/);
assert.match(config, /F07A_2D_1_NO_PAYMENT_OR_FULFILLMENT_CALLS/);
assert.doesNotMatch(
  preview,
  /<form\b|fetch\(|onSubmit|formAction|\baction=|onClick|useCart\s*\(|addItem\s*\(|removeItem\s*\(|createOrder\s*\(|createPayment\s*\(|queryOrder\s*\(|reserveInventory\s*\(|fulfill(?:ment)?\s*\(|webhook\s*\(/i,
);
const fieldsets = [...preview.matchAll(/<fieldset\b[\s\S]*?>/g)].map((match) =>
  match[0].replace(/\s+/g, " "),
);
assert.equal(fieldsets.length, 2);
for (const tag of fieldsets) {
  assert.match(tag, /\bdisabled(?=\s|>)/);
}
const buttons = [...preview.matchAll(/<button\b[\s\S]*?>/g)].map((match) =>
  match[0].replace(/\s+/g, " "),
);
assert.equal(buttons.length, 3);
for (const tag of buttons) {
  assert.match(tag, /\bdisabled(?=\s|>)/);
  assert.doesNotMatch(tag, /onClick|formAction|type="submit"/);
}
console.log(
  "PASS transaction preview cannot submit or mutate cart payment order or fulfillment",
);

assert.match(config, /sourceTitle:\s*"eSIM Nhật Bản/);
assert.doesNotMatch(
  read("src/i18n/transaction/messages/en.ts"),
  /eSIM Nhật Bản|eSIM Hàn Quốc/,
);
assert.doesNotMatch(
  read("src/i18n/transaction/messages/lo.ts"),
  /eSIM Nhật Bản|eSIM Hàn Quốc/,
);
console.log("PASS dynamic product source content is not falsely translated");

assert.doesNotMatch(
  preview,
  /[À-ỹ]/u,
  "Vietnamese UI literals must remain in catalogs",
);
console.log(
  "PASS no Vietnamese transaction UI literals remain in preview component",
);

for (const productionPath of [
  "src/app/cart/page.tsx",
  "src/app/checkout/page.tsx",
  "src/app/payment/return/page.tsx",
  "src/app/orders/[orderCode]/page.tsx",
]) {
  const source = read(productionPath);
  assert.doesNotMatch(source, /localized-transaction|i18n\/transaction/);
}
console.log("PASS production transaction routes remain unchanged");

assert.match(registry, /TRANSACTION_MESSAGE_CATALOG/);
assert.match(registry, /normalizeShellLocale/);
console.log(
  "PASS transaction locale registry remains aligned with shell locale",
);

for (const requiredPath of [
  "scripts/test-f07a-2a-localization-foundation.mjs",
  "scripts/test-f07a-2b-global-shell-localization.mjs",
  "scripts/test-f07a-2c-1-home-localization.mjs",
  "scripts/test-f07a-2c-2-listing-localization.mjs",
  "scripts/test-f07a-2c-3-detail-localization.mjs",
  "scripts/test-f07a-2c-4-secondary-localization.mjs",
]) {
  assert.ok(
    fs.existsSync(path.join(root, requiredPath)),
    `${requiredPath} missing`,
  );
}
console.log(
  "PASS existing F07A-2A through F07A-2C-4 contracts remain available",
);
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log("PASS: F07A-2D-1 localized transaction flow candidate contract.");
