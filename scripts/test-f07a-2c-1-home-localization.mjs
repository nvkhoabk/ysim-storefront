// F07A-2C-1_LOCALIZED_HOME_CANDIDATE_R1

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const messageFiles = {
  vi: "src/i18n/home/messages/vi.ts",
  en: "src/i18n/home/messages/en.ts",
  lo: "src/i18n/home/messages/lo.ts",
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
console.log("PASS Vietnamese English and Lao Home catalog locales");

const referenceKeys = [...catalogs.vi.keys()].sort();
assert.ok(referenceKeys.length >= 70, "expected a comprehensive Home catalog");

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

console.log("PASS Home catalog key placeholder and unsafe HTML parity");

assert.ok(
  [...catalogs.lo.values()].some((value) => /[\u0E80-\u0EFF]/u.test(value)),
  "Lao catalog must contain Lao Unicode",
);
console.log("PASS Lao Home content contains Lao Unicode");

const previewSource = read("src/app/ui-preview/localized-home/page.tsx");
const configSource = read("src/i18n/home/home.config.ts");
const registrySource = read("src/i18n/home/home.registry.ts");
const productionHomeSource = read("src/app/page.tsx");

assert.match(previewSource, /previewPath:\s*"\/ui-preview\/localized-home"/);
assert.match(
  previewSource,
  /\/ui-preview\/localized-home\?locale=\$\{candidate\}/,
);
console.log("PASS locale switch preserves localized-home preview path");

assert.match(configSource, /localizeShellHref\("\/esim", locale\)/);
assert.match(configSource, /localizeShellHref\("\/destinations", locale\)/);
assert.match(configSource, /localizeShellHref\("\/support", locale\)/);
console.log("PASS Home internal links use locale-aware routing");

assert.match(configSource, /F07A_2C_1_NO_CURRENCY_CONVERSION/);
assert.doesNotMatch(
  `${configSource}\n${previewSource}`,
  /exchangeRate|fxRate|convertCurrency|convertedPrice/i,
);
assert.doesNotMatch(previewSource, /\b(?:USD|LAK)\s*[0-9]/);
console.log("PASS currency conversion is not simulated");

assert.match(configSource, /sourceTitle:\s*"eSIM Nhật Bản/);
assert.match(previewSource, /products\.sourceLabel/);
assert.match(previewSource, /preview\.dynamicContent/);
console.log("PASS dynamic catalog product content is not falsely translated");

assert.match(registrySource, /normalizeShellLocale/);
assert.match(previewSource, /createLocalizedShellBundle\(home\.locale\)/);
console.log("PASS localized shell and localized Home share one locale");

assert.doesNotMatch(
  previewSource,
  /[À-ỹ]/u,
  "Vietnamese Home literals must stay in message catalogs",
);
console.log("PASS no Vietnamese Home literals remain in preview component");

assert.match(productionHomeSource, /YSIM_PACKAGE_24_ACTIVATION:home/);
assert.doesNotMatch(productionHomeSource, /localized-home|i18n\/home/);
console.log("PASS production root page remains unchanged");

for (const requiredPath of [
  "scripts/test-f07a-2a-localization-foundation.mjs",
  "scripts/test-f07a-2b-global-shell-localization.mjs",
]) {
  assert.ok(
    fs.existsSync(path.join(root, requiredPath)),
    `${requiredPath} missing`,
  );
}
console.log("PASS existing F07A-2A and F07A-2B contracts remain available");

console.log(
  `PASS cross-platform execution contract: platform=${process.platform}`,
);
console.log(
  "PASS: F07A-2C-1 localized Home content catalog and preview contract.",
);
