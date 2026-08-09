#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";

const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_MAX_PAGES = 10;

function printHelp() {
  console.log(`
YSim catalog diagnostic

Usage:
  node --env-file=.env.local scripts/diagnose-catalog.mjs [options]

Options:
  --destination=KR             Destination value currently sent by the UI/API
  --aliases=KR,kr,south-korea Additional destination values to test
  --locale=vi                  Localization locale (default: vi)
  --expected-woo=32            Expected published WooCommerce parent products
  --page-size=100              Page size for both APIs (default: 100)
  --max-pages=10               Pagination safety limit (default: 10)
  --timeout-ms=20000           Per-request timeout (default: 20000)
  --output=path.json           Output path; default is artifacts/catalog-diagnostic-*.json
  --help                       Show this help

Required environment variables:
  NEXT_PUBLIC_WOOCOMMERCE_URL  Example: https://shop.ysim.vn
  YSIM_API_BASE_URL            Base URL exposing GET /products
`);
}

function parseArgs(argv) {
  const options = {
    destination: "",
    aliases: [],
    locale: "vi",
    expectedWoo: null,
    pageSize: DEFAULT_PAGE_SIZE,
    maxPages: DEFAULT_MAX_PAGES,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    output: "",
  };

  for (const argument of argv) {
    if (argument === "--help" || argument === "-h") {
      printHelp();
      process.exit(0);
    }

    const [rawKey, ...rawValueParts] = argument.split("=");
    const value = rawValueParts.join("=").trim();

    switch (rawKey) {
      case "--destination":
        options.destination = value;
        break;
      case "--aliases":
        options.aliases = value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        break;
      case "--locale":
        options.locale = value || "vi";
        break;
      case "--expected-woo":
        options.expectedWoo = parsePositiveInteger(value, "--expected-woo");
        break;
      case "--page-size":
        options.pageSize = Math.min(
          100,
          parsePositiveInteger(value, "--page-size"),
        );
        break;
      case "--max-pages":
        options.maxPages = parsePositiveInteger(value, "--max-pages");
        break;
      case "--timeout-ms":
        options.timeoutMs = parsePositiveInteger(value, "--timeout-ms");
        break;
      case "--output":
        options.output = value;
        break;
      default:
        throw new Error(`Unknown option: ${argument}`);
    }
  }

  return options;
}

function parsePositiveInteger(value, optionName) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${optionName} must be a positive integer.`);
  }
  return parsed;
}

function normalizeBaseUrl(value, variableName) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\/+$/, "");
  if (!normalized) {
    throw new Error(`${variableName} is not configured.`);
  }

  const url = new URL(normalized);
  if (!/^https?:$/.test(url.protocol)) {
    throw new Error(`${variableName} must use http or https.`);
  }

  return normalized;
}

function createOutputPath(explicitPath) {
  if (explicitPath) {
    return resolve(explicitPath);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return resolve(`artifacts/catalog-diagnostic-${timestamp}.json`);
}

function uniqueStrings(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function buildDestinationTests(destination, aliases) {
  const values = [...aliases];

  if (destination) {
    values.unshift(
      destination,
      destination.toLowerCase(),
      destination.toUpperCase(),
    );
  }

  return uniqueStrings(values);
}

async function fetchJson(url, { timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ysim-storefront-catalog-diagnostic/1.0",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    const rawBody = await response.text();
    let body = null;

    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = rawBody.slice(0, 2_000);
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      durationMs: Date.now() - startedAt,
      headers: Object.fromEntries(response.headers.entries()),
      body,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      durationMs: Date.now() - startedAt,
      headers: {},
      body: null,
      error: serializeError(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

function serializeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function asString(value) {
  return typeof value === "string" ? value : "";
}

function asNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function compactTaxonomyEntry(entry) {
  const item = asObject(entry);
  return {
    id: asNumber(item.id),
    name: asString(item.name),
    slug: asString(item.slug),
  };
}

function compactWooAttribute(attribute) {
  const item = asObject(attribute);
  return {
    id: asNumber(item.id),
    name: asString(item.name),
    taxonomy: asString(item.taxonomy),
    hasVariations: Boolean(item.has_variations),
    terms: asArray(item.terms).map((term) => compactTaxonomyEntry(term)),
  };
}

function compactWooProduct(product) {
  const item = asObject(product);
  const variations = asArray(item.variations);

  return {
    id: asNumber(item.id),
    name: asString(item.name),
    slug: asString(item.slug),
    sku: asString(item.sku),
    type: asString(item.type),
    purchasable: Boolean(item.is_purchasable),
    inStock: Boolean(item.is_in_stock),
    categories: asArray(item.categories).map((category) =>
      compactTaxonomyEntry(category),
    ),
    tags: asArray(item.tags).map((tag) => compactTaxonomyEntry(tag)),
    attributes: asArray(item.attributes).map((attribute) =>
      compactWooAttribute(attribute),
    ),
    variationCount: variations.length,
    variationIds: variations
      .map((variation) => asNumber(asObject(variation).id))
      .filter((id) => id !== null),
  };
}

function compactLocalizedAttribute(attribute) {
  const item = asObject(attribute);
  return {
    name: asString(item.name),
    slug: asString(item.slug),
    hasVariations: Boolean(item.hasVariations),
    options: asArray(item.options).map((option) => {
      const value = asObject(option);
      return {
        name: asString(value.name),
        value: asString(value.value),
      };
    }),
  };
}

function compactLocalizedItem(resolvedItem) {
  const resolved = asObject(resolvedItem);
  const product = asObject(resolved.product);

  return {
    familyId: asNumber(resolved.familyId),
    familyCode: asString(resolved.familyCode),
    requestedLocale: asString(resolved.requestedLocale),
    resolvedLocale: asString(resolved.resolvedLocale),
    fallbackUsed: Boolean(resolved.fallbackUsed),
    fallbackReason: resolved.fallbackReason ?? null,
    product: {
      id: asNumber(product.id),
      name: asString(product.name),
      slug: asString(product.slug),
      sku: asString(product.sku),
      type: asString(product.type),
      locale: asString(product.locale),
      featured: Boolean(product.featured),
      purchasable: Boolean(product.purchasable),
      inStock: Boolean(product.inStock),
      categories: asArray(product.categories).map((category) => {
        const item = asObject(category);
        return {
          id: asNumber(item.id),
          name: asString(item.name),
          slug: asString(item.slug),
          parentId: asNumber(item.parentId),
        };
      }),
      attributes: asArray(product.attributes).map((attribute) =>
        compactLocalizedAttribute(attribute),
      ),
      variationCount: asArray(product.variations).length,
      variationIds: asArray(product.variations)
        .map((variation) => asNumber(asObject(variation).id))
        .filter((id) => id !== null),
    },
  };
}

function isDestinationKey(value) {
  const normalized = value
    .toLocaleLowerCase("vi-VN")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

  return [
    "destination",
    "destination-code",
    "destination_code",
    "country",
    "country-code",
    "country_code",
    "quoc-gia",
    "quoc_gia",
    "diem-den",
    "diem_den",
    "region",
    "khu-vuc",
    "khu_vuc",
  ].some((candidate) => normalized.includes(candidate));
}

function destinationHintsFromWoo(product) {
  const hints = [];

  for (const category of product.categories) {
    hints.push(category.slug, category.name);
  }

  for (const tag of product.tags) {
    hints.push(tag.slug, tag.name);
  }

  for (const attribute of product.attributes) {
    if (isDestinationKey(`${attribute.name} ${attribute.taxonomy}`)) {
      hints.push(attribute.name, attribute.taxonomy);
      for (const term of attribute.terms) {
        hints.push(term.slug, term.name);
      }
    }
  }

  return uniqueStrings(hints);
}

function destinationHintsFromLocalized(item) {
  const hints = [];

  for (const category of item.product.categories) {
    hints.push(category.slug, category.name);
  }

  for (const attribute of item.product.attributes) {
    if (isDestinationKey(`${attribute.name} ${attribute.slug}`)) {
      hints.push(attribute.name, attribute.slug);
      for (const option of attribute.options) {
        hints.push(option.name, option.value);
      }
    }
  }

  return uniqueStrings(hints);
}

async function fetchWooCatalog({ baseUrl, pageSize, maxPages, timeoutMs }) {
  const products = [];
  const requests = [];
  let totalPages = 1;
  let advertisedTotal = null;

  for (let page = 1; page <= Math.min(totalPages, maxPages); page += 1) {
    const url = new URL(`${baseUrl}/wp-json/wc/store/v1/products`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(pageSize));

    const result = await fetchJson(url, { timeoutMs });
    requests.push({
      page,
      url: sanitizeUrl(url),
      ok: result.ok,
      status: result.status,
      durationMs: result.durationMs,
      error: result.error ?? null,
    });

    if (!result.ok) {
      return {
        ok: false,
        products,
        requests,
        advertisedTotal,
        totalPages,
        error: result.body ?? result.error ?? `HTTP ${result.status}`,
      };
    }

    const pageItems = asArray(result.body);
    products.push(...pageItems.map((product) => compactWooProduct(product)));

    const headerTotalPages = Number.parseInt(
      result.headers["x-wp-totalpages"] ?? "1",
      10,
    );
    const headerTotal = Number.parseInt(result.headers["x-wp-total"] ?? "", 10);

    totalPages = Number.isFinite(headerTotalPages)
      ? Math.max(1, headerTotalPages)
      : 1;
    advertisedTotal = Number.isFinite(headerTotal) ? headerTotal : null;
  }

  return {
    ok: true,
    products,
    requests,
    advertisedTotal,
    totalPages,
    truncated: totalPages > maxPages,
  };
}

async function fetchLocalizedCatalog({
  baseUrl,
  locale,
  destination,
  pageSize,
  maxPages,
  timeoutMs,
}) {
  const items = [];
  const requests = [];
  let totalPages = 1;
  let pagination = null;

  for (let page = 1; page <= Math.min(totalPages, maxPages); page += 1) {
    const url = new URL(`${baseUrl}/products`);
    url.searchParams.set("locale", locale);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", String(pageSize));
    if (destination) {
      url.searchParams.set("destination", destination);
    }

    const result = await fetchJson(url, { timeoutMs });
    requests.push({
      page,
      url: sanitizeUrl(url),
      ok: result.ok,
      status: result.status,
      durationMs: result.durationMs,
      error: result.error ?? null,
    });

    if (!result.ok) {
      return {
        ok: false,
        items,
        requests,
        pagination,
        totalPages,
        error: result.body ?? result.error ?? `HTTP ${result.status}`,
      };
    }

    const body = asObject(result.body);
    const pageItems = asArray(body.items);
    items.push(...pageItems.map((item) => compactLocalizedItem(item)));

    const responsePagination = asObject(body.pagination);
    const responseTotalPages = asNumber(responsePagination.totalPages);
    totalPages = responseTotalPages ? Math.max(1, responseTotalPages) : 1;
    pagination = {
      page: asNumber(responsePagination.page),
      pageSize: asNumber(responsePagination.pageSize),
      total: asNumber(responsePagination.total),
      totalPages: responseTotalPages,
    };
  }

  return {
    ok: true,
    items,
    requests,
    pagination,
    totalPages,
    truncated: totalPages > maxPages,
  };
}

function sanitizeUrl(url) {
  const sanitized = new URL(url);
  sanitized.username = "";
  sanitized.password = "";

  for (const key of [...sanitized.searchParams.keys()]) {
    if (/key|secret|token|password|signature/i.test(key)) {
      sanitized.searchParams.set(key, "[REDACTED]");
    }
  }

  return sanitized.toString();
}

function normalizeSku(value) {
  return value.trim().toUpperCase();
}

function compareCatalogs(wooProducts, localizedItems) {
  const wooIds = new Set(
    wooProducts.map((product) => product.id).filter((id) => id !== null),
  );
  const localizedIds = new Set(
    localizedItems.map((item) => item.product.id).filter((id) => id !== null),
  );

  const wooSkus = new Set(
    wooProducts.map((product) => normalizeSku(product.sku)).filter(Boolean),
  );
  const localizedSkus = new Set(
    localizedItems
      .map((item) => normalizeSku(item.product.sku))
      .filter(Boolean),
  );

  return {
    wooOnlyById: wooProducts
      .filter((product) => product.id !== null && !localizedIds.has(product.id))
      .map((product) => ({
        id: product.id,
        sku: product.sku,
        slug: product.slug,
        name: product.name,
      })),
    localizedOnlyById: localizedItems
      .filter(
        (item) => item.product.id !== null && !wooIds.has(item.product.id),
      )
      .map((item) => ({
        id: item.product.id,
        familyCode: item.familyCode,
        sku: item.product.sku,
        slug: item.product.slug,
        name: item.product.name,
      })),
    wooOnlyBySku: wooProducts
      .filter(
        (product) =>
          normalizeSku(product.sku) &&
          !localizedSkus.has(normalizeSku(product.sku)),
      )
      .map((product) => ({
        id: product.id,
        sku: product.sku,
        slug: product.slug,
        name: product.name,
      })),
    localizedOnlyBySku: localizedItems
      .filter(
        (item) =>
          normalizeSku(item.product.sku) &&
          !wooSkus.has(normalizeSku(item.product.sku)),
      )
      .map((item) => ({
        id: item.product.id,
        familyCode: item.familyCode,
        sku: item.product.sku,
        slug: item.product.slug,
        name: item.product.name,
      })),
  };
}

function buildWarnings({
  expectedWoo,
  wooCatalog,
  localizedCatalog,
  destinationResults,
  comparison,
}) {
  const warnings = [];

  if (!wooCatalog.ok) {
    warnings.push({
      code: "WOO_STORE_API_FAILED",
      message:
        "WooCommerce Store API could not be read. Check maintenance mode, firewall, HTTPS, or public catalog visibility.",
    });
  }

  if (!localizedCatalog.ok) {
    warnings.push({
      code: "LOCALIZATION_API_FAILED",
      message:
        "Localization API GET /products failed. Check YSIM_API_BASE_URL, deployment, and upstream logs.",
    });
  }

  if (
    expectedWoo !== null &&
    wooCatalog.ok &&
    wooCatalog.products.length < expectedWoo
  ) {
    warnings.push({
      code: "WOO_PUBLIC_COUNT_BELOW_EXPECTED",
      message: `Woo Store API returned ${wooCatalog.products.length}, below the expected ${expectedWoo}. Draft, private, hidden, or non-catalog products are not visible to the storefront.`,
    });
  }

  if (
    wooCatalog.ok &&
    localizedCatalog.ok &&
    localizedCatalog.items.length < wooCatalog.products.length
  ) {
    warnings.push({
      code: "LOCALIZATION_COUNT_BELOW_WOO",
      message: `Localization API returned ${localizedCatalog.items.length} product families while Woo Store API returned ${wooCatalog.products.length} products. Sync/family/localization coverage is incomplete or the APIs point to different environments.`,
    });
  }

  if (comparison.wooOnlyById.length > 0) {
    warnings.push({
      code: "WOO_PRODUCTS_MISSING_FROM_LOCALIZATION",
      message: `${comparison.wooOnlyById.length} Woo products were not found in Localization API by product ID.`,
    });
  }

  const successfulDestinationResults = destinationResults.filter(
    (result) => result.catalog.ok,
  );
  const nonZeroDestinationResults = successfulDestinationResults.filter(
    (result) => result.catalog.items.length > 0,
  );

  if (
    successfulDestinationResults.length > 1 &&
    nonZeroDestinationResults.length > 0 &&
    nonZeroDestinationResults.length < successfulDestinationResults.length
  ) {
    warnings.push({
      code: "DESTINATION_ALIAS_CONTRACT_MISMATCH",
      message:
        "Some destination aliases return products while others return none. The UI and Localization API likely disagree on ISO code versus slug/value format.",
    });
  }

  if (
    destinationResults.length > 0 &&
    successfulDestinationResults.every(
      (result) => result.catalog.items.length === 0,
    ) &&
    localizedCatalog.ok &&
    localizedCatalog.items.length > 0
  ) {
    warnings.push({
      code: "DESTINATION_FILTER_REMOVES_ALL_PRODUCTS",
      message:
        "The unfiltered Localization API has products, but every tested destination value returns zero. Check the backend destination mapping and Woo attribute/category values.",
    });
  }

  const wooWithoutDestinationHints = wooCatalog.ok
    ? wooCatalog.products.filter(
        (product) => destinationHintsFromWoo(product).length === 0,
      ).length
    : 0;

  if (wooWithoutDestinationHints > 0) {
    warnings.push({
      code: "WOO_PRODUCTS_WITHOUT_DESTINATION_HINT",
      message: `${wooWithoutDestinationHints} Woo products expose no recognizable country/destination category, tag, or attribute through Store API.`,
    });
  }

  return warnings;
}

function printSummary(report) {
  const wooCount = report.wooCatalog.ok
    ? report.wooCatalog.products.length
    : "FAILED";
  const localizedCount = report.localizedCatalog.ok
    ? report.localizedCatalog.items.length
    : "FAILED";

  console.log("\n=== YSim catalog diagnostic ===");
  console.log(`Woo Store API products: ${wooCount}`);
  console.log(`Localization product families: ${localizedCount}`);

  if (report.destinationResults.length > 0) {
    console.log("\nDestination filter matrix:");
    for (const result of report.destinationResults) {
      const count = result.catalog.ok
        ? result.catalog.items.length
        : `FAILED (${result.catalog.requests.at(-1)?.status ?? 0})`;
      console.log(`  ${result.value}: ${count}`);
    }
  }

  console.log("\nWarnings:");
  if (report.warnings.length === 0) {
    console.log("  none");
  } else {
    for (const warning of report.warnings) {
      console.log(`  [${warning.code}] ${warning.message}`);
    }
  }

  console.log(`\nFull report: ${report.outputPath}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const wooCommerceBaseUrl = normalizeBaseUrl(
    process.env.NEXT_PUBLIC_WOOCOMMERCE_URL ?? process.env.WOOCOMMERCE_URL,
    "NEXT_PUBLIC_WOOCOMMERCE_URL",
  );
  const ysimApiBaseUrl = normalizeBaseUrl(
    process.env.YSIM_API_BASE_URL,
    "YSIM_API_BASE_URL",
  );
  const outputPath = createOutputPath(options.output);
  const destinationTests = buildDestinationTests(
    options.destination,
    options.aliases,
  );

  console.log("Reading WooCommerce Store API...");
  const wooCatalog = await fetchWooCatalog({
    baseUrl: wooCommerceBaseUrl,
    pageSize: options.pageSize,
    maxPages: options.maxPages,
    timeoutMs: options.timeoutMs,
  });

  console.log("Reading unfiltered Localization API...");
  const localizedCatalog = await fetchLocalizedCatalog({
    baseUrl: ysimApiBaseUrl,
    locale: options.locale,
    destination: "",
    pageSize: options.pageSize,
    maxPages: options.maxPages,
    timeoutMs: options.timeoutMs,
  });

  const destinationResults = [];
  for (const value of destinationTests) {
    console.log(`Testing destination=${value}...`);
    const catalog = await fetchLocalizedCatalog({
      baseUrl: ysimApiBaseUrl,
      locale: options.locale,
      destination: value,
      pageSize: options.pageSize,
      maxPages: options.maxPages,
      timeoutMs: options.timeoutMs,
    });
    destinationResults.push({ value, catalog });
  }

  const comparison = compareCatalogs(
    wooCatalog.products ?? [],
    localizedCatalog.items ?? [],
  );

  const warnings = buildWarnings({
    expectedWoo: options.expectedWoo,
    wooCatalog,
    localizedCatalog,
    destinationResults,
    comparison,
  });

  const report = {
    generatedAt: new Date().toISOString(),
    configuration: {
      wooCommerceBaseUrl: sanitizeUrl(new URL(wooCommerceBaseUrl)),
      ysimApiBaseUrl: sanitizeUrl(new URL(ysimApiBaseUrl)),
      locale: options.locale,
      expectedWoo: options.expectedWoo,
      destinationTests,
      pageSize: options.pageSize,
      maxPages: options.maxPages,
      timeoutMs: options.timeoutMs,
    },
    architectureObservation: {
      storefrontProductSource:
        "src/lib/woocommerce/products.ts calls Localization API GET /products, not Woo Store API directly.",
      diagnosticGoal:
        "Compare public Woo catalog, Localization API coverage, and destination filter value contract.",
    },
    wooCatalog: {
      ...wooCatalog,
      products: (wooCatalog.products ?? []).map((product) => ({
        ...product,
        destinationHints: destinationHintsFromWoo(product),
      })),
    },
    localizedCatalog: {
      ...localizedCatalog,
      items: (localizedCatalog.items ?? []).map((item) => ({
        ...item,
        destinationHints: destinationHintsFromLocalized(item),
      })),
    },
    destinationResults,
    comparison,
    warnings,
    outputPath,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  printSummary(report);

  if (!wooCatalog.ok || !localizedCatalog.ok) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error("Catalog diagnostic failed:", error);
  process.exitCode = 1;
});
