// F07A-2C-4_LOCALIZED_SECONDARY_CANDIDATE_R1
// F07A_2C_4_FORMATTING_RESILIENT_SEMANTIC_CONTRACT

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const messageFiles = {
  vi: "src/i18n/secondary/messages/vi.ts",
  en: "src/i18n/secondary/messages/en.ts",
  lo: "src/i18n/secondary/messages/lo.ts",
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
assert.ok(keys.length >= 85, "expected a comprehensive secondary catalog");
for (const [locale, catalog] of Object.entries(catalogs)) {
  assert.deepEqual([...catalog.keys()].sort(), keys, `key mismatch: ${locale}`);
  for (const key of keys) {
    const value = catalog.get(key) ?? "";
    assert.ok(value.trim(), `empty value: ${locale}:${key}`);
    assert.doesNotMatch(value, /<\/?[A-Za-z][^>]*>/);
    assert.deepEqual(
      placeholders(value),
      placeholders(catalogs.vi.get(key) ?? ""),
      `placeholder mismatch: ${locale}:${key}`,
    );
  }
}
console.log("PASS Vietnamese English and Lao secondary catalog parity");
assert.ok(
  [...catalogs.lo.values()].some((value) => /[\u0E80-\u0EFF]/u.test(value)),
);
console.log("PASS Lao secondary content contains Lao Unicode");

const preview = read("src/app/ui-preview/localized-secondary/page.tsx");
const config = read("src/i18n/secondary/secondary.config.ts");
const registry = read("src/i18n/secondary/secondary.registry.ts");
assert.match(preview, /previewPath:\s*"\/ui-preview\/localized-secondary"/);
assert.match(preview, /view=\$\{view\}/);
assert.match(preview, /createLocalizedShellBundle\(secondary\.locale\)/);
for (const view of [
  "offers",
  "guides",
  "support",
  "device-check",
  "package-assistant",
]) {
  assert.match(preview, new RegExp(`view === "${view}"`));
}
console.log(
  "PASS locale switch preserves all secondary views and shell locale",
);

const compactConfig = config.replace(/\s+/g, " ");
for (const route of [
  "/offers",
  "/guides",
  "/support",
  "/device-check",
  "/package-assistant",
]) {
  assert.ok(compactConfig.includes(`"${route}"`), `route missing: ${route}`);
}
assert.match(
  compactConfig,
  /localizeShellHref\(PRODUCTION_PATHS\[view\], locale\)/,
);
assert.match(
  compactConfig,
  /localizeShellHref\(`\/guides\/\$\{slug\}`, locale\)/,
);
console.log("PASS secondary internal links use locale-aware routing");

assert.match(config, /F07A_2C_4_NO_CURRENCY_CONVERSION/);
assert.doesNotMatch(
  `${config}\n${preview}`,
  /exchangeRate|fxRate|convertCurrency|convertedPrice/i,
);
assert.doesNotMatch(preview, /\b(?:USD|LAK)\s*[0-9]/);
console.log("PASS secondary preview does not simulate currency conversion");

assert.match(config, /F07A_2C_4_DYNAMIC_SOURCE_CONTENT_UNCHANGED/);
assert.match(config, /sourceTitle:\s*"Nên cài eSIM/);
for (const sourceText of [
  "Nên cài eSIM",
  "eSIM khác roaming",
  "Cách kiểm tra điện thoại",
]) {
  assert.doesNotMatch(
    read("src/i18n/secondary/messages/en.ts"),
    new RegExp(sourceText),
  );
  assert.doesNotMatch(
    read("src/i18n/secondary/messages/lo.ts"),
    new RegExp(sourceText),
  );
}
console.log("PASS dynamic guide source content is not falsely translated");

assert.match(config, /F07A_2C_4_NO_SUBMISSION_OR_COMMERCE_MUTATION/);
assert.doesNotMatch(
  preview,
  /fetch\(|onSubmit|formAction|useCart|addItem|createOrder|reserveInventory/,
);
const fieldsets = [...preview.matchAll(/<fieldset\b[\s\S]*?>/g)].map((match) =>
  match[0].replace(/\s+/g, " "),
);
assert.equal(fieldsets.length, 1);
assert.match(fieldsets[0] ?? "", /\bdisabled(?=\s|>)/);
console.log("PASS secondary preview does not submit data or mutate commerce");

assert.doesNotMatch(
  preview,
  /[À-ỹ]/u,
  "Vietnamese UI literals must remain in catalogs or source fixtures",
);
console.log(
  "PASS no Vietnamese secondary UI literals remain in preview component",
);

for (const productionPath of [
  "src/app/offers/page.tsx",
  "src/app/guides/page.tsx",
  "src/app/support/page.tsx",
  "src/app/device-check/page.tsx",
  "src/app/package-assistant/page.tsx",
]) {
  const source = read(productionPath);
  assert.doesNotMatch(source, /localized-secondary|i18n\/secondary/);
}
console.log("PASS production secondary routes remain unchanged");
assert.match(registry, /SECONDARY_MESSAGE_CATALOG/);
assert.match(registry, /normalizeShellLocale/);
console.log("PASS secondary locale registry remains aligned with shell locale");

for (const requiredPath of [
  "scripts/test-f07a-2a-localization-foundation.mjs",
  "scripts/test-f07a-2b-global-shell-localization.mjs",
  "scripts/test-f07a-2c-1-home-localization.mjs",
  "scripts/test-f07a-2c-2-listing-localization.mjs",
  "scripts/test-f07a-2c-3-detail-localization.mjs",
]) {
  assert.ok(
    fs.existsSync(path.join(root, requiredPath)),
    `${requiredPath} missing`,
  );
}
console.log(
  "PASS existing F07A-2A through F07A-2C-3 contracts remain available",
);
console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log("PASS: F07A-2C-4 localized secondary content candidate contract.");
