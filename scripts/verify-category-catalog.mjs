#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const destinationAliases = new Map([
  ["jp", "japan"],
  ["japan", "japan"],
  ["nhat-ban", "japan"],
  ["kr", "korea"],
  ["korea", "korea"],
  ["south-korea", "korea"],
  ["han-quoc", "korea"],
  ["th", "thailand"],
  ["thailand", "thailand"],
  ["thai-lan", "thailand"],
  ["us", "usa"],
  ["usa", "usa"],
  ["united-states", "usa"],
]);

function canonical(value) {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return destinationAliases.get(normalized) || normalized;
}

function categoryMatches(product, destination) {
  const target = canonical(destination);
  return (product.categories || []).some((category) => canonical(category.slug) === target);
}

function destinationCodeMatches(product, destination) {
  const target = canonical(destination);
  return (product.attributes || []).some((attribute) => {
    const key = String(attribute.name || attribute.taxonomy || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    if (key !== "destination_code") {
      return false;
    }
    return (attribute.terms || []).some((term) => canonical(term.slug || term.name) === target);
  });
}

async function readReport(filename) {
  const raw = await fs.readFile(filename, "utf8");
  const report = JSON.parse(raw);
  if (!Array.isArray(report?.wooCatalog?.products)) {
    throw new Error(`${filename}: missing wooCatalog.products array`);
  }
  return report;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const filenames = process.argv.slice(2);
if (filenames.length === 0) {
  console.error("Usage: node scripts/verify-category-catalog.mjs <catalog-diagnostic.json> [...]");
  process.exit(2);
}

let checked = 0;
for (const filename of filenames) {
  const report = await readReport(filename);
  const products = report.wooCatalog.products;
  const testValues = report.configuration?.destinationTests || [];
  const requested = testValues[0] || "";
  const target = canonical(requested);
  const matched = products.filter((product) => categoryMatches(product, target));
  const attributeOnly = products.filter(
    (product) => destinationCodeMatches(product, target) && !categoryMatches(product, target),
  );

  console.log(`\n${path.basename(filename)}`);
  console.log(`  destination: ${requested} -> ${target}`);
  console.log(`  Woo parent products: ${products.length}`);
  console.log(`  category matches: ${matched.length}`);
  for (const product of matched) {
    console.log(`    - ${product.id} ${product.slug}`);
  }
  console.log(`  ignored destination_code-only false positives: ${attributeOnly.length}`);
  for (const product of attributeOnly.slice(0, 10)) {
    console.log(`    - ${product.id} ${product.slug}`);
  }

  assert(matched.length > 0, `${requested}: category filter unexpectedly returned zero products`);
  if (target === "japan") {
    assert(
      matched.length === 1 && matched[0]?.slug === "esim-nhat-ban",
      "Japan must be resolved from category=japan, not from copied destination_code=JP attributes",
    );
    assert(attributeOnly.length > 0, "Expected imported destination_code=JP false positives were not detected");
  }
  if (target === "korea") {
    assert(matched.some((product) => product.slug === "esim-han-quoc"), "Korea product was not matched by category=korea");
  }
  if (target === "thailand") {
    const slugs = new Set(matched.map((product) => product.slug));
    for (const expected of ["esim-thai-lan", "esim-asia-4", "esim-chau-a-11-nuoc"]) {
      assert(slugs.has(expected), `Thailand must include ${expected}`);
    }
  }
  checked += 1;
}

console.log(`\nPASS: ${checked} diagnostic report(s) validated with category-authoritative filtering.`);
