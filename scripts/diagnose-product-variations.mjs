#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (const value of argv) {
    if (!value.startsWith("--")) {
      if (!args.slug) args.slug = value;
      continue;
    }
    const separator = value.indexOf("=");
    if (separator === -1) {
      args[value.slice(2)] = true;
      continue;
    }
    args[value.slice(2, separator)] = value.slice(separator + 1);
  }
  return args;
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function variationReferences(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || !Number.isInteger(Number(item.id))) return [];
    const attributes = Array.isArray(item.attributes)
      ? item.attributes.flatMap((attribute) => {
          if (!isRecord(attribute)) return [];
          const name = nonEmptyString(attribute.name);
          const attributeValue = nonEmptyString(attribute.value);
          return name ? [{ name, value: attributeValue ?? null }] : [];
        })
      : [];
    return [{ id: Number(item.id), attributes }];
  });
}

function normalizeToken(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dimensionKind(name) {
  const value = normalizeToken(name);
  if (
    ["dung-luong", "data", "capacity", "allowance", "data-amount"].some(
      (signal) => value.includes(signal),
    )
  ) {
    return "capacity";
  }
  if (
    ["so-ngay", "duration", "validity", "days", "day", "thoi-han"].some(
      (signal) => value.includes(signal),
    )
  ) {
    return "duration";
  }
  return "other";
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) {
    const error = new Error(`${response.status} ${url}: ${text.slice(0, 500)}`);
    error.status = response.status;
    throw error;
  }
  return text ? JSON.parse(text) : null;
}

async function fetchPages(baseUrl, endpoint) {
  const results = [];
  const separator = endpoint.includes("?") ? "&" : "?";
  for (let page = 1; page <= 20; page += 1) {
    const value = await fetchJson(
      `${baseUrl}${endpoint}${separator}per_page=100&page=${page}`,
    );
    if (!Array.isArray(value)) {
      throw new Error(`Expected an array from ${endpoint}.`);
    }
    results.push(...value);
    if (value.length < 100) break;
  }
  return results;
}

function chunks(values, size) {
  const output = [];
  for (let index = 0; index < values.length; index += size) {
    output.push(values.slice(index, index + size));
  }
  return output;
}

async function fetchByReferenceIds(storeApiBase, ids) {
  const results = [];
  for (const group of chunks(ids, 100)) {
    const query = new URLSearchParams({
      type: "variation",
      include: group.join(","),
      catalog_visibility: "any",
      orderby: "include",
      per_page: String(group.length),
    });
    const value = await fetchJson(`${storeApiBase}/products?${query}`);
    if (!Array.isArray(value)) {
      throw new Error("Expected variation include query to return an array.");
    }
    results.push(...value);
  }
  return results;
}

function fullVariationSelectedAttributeCount(product) {
  if (!Array.isArray(product?.attributes)) return 0;
  return product.attributes.filter((attribute) => {
    return (
      isRecord(attribute) &&
      nonEmptyString(attribute.slug) &&
      nonEmptyString(attribute.value)
    );
  }).length;
}

function matrixFromReferences(references) {
  const dimensions = new Map();
  const pairs = [];
  for (const reference of references) {
    const pair = {};
    for (const attribute of reference.attributes) {
      if (!attribute.value) continue;
      const key = attribute.name;
      const current = dimensions.get(key) || new Set();
      current.add(attribute.value);
      dimensions.set(key, current);
      pair[key] = attribute.value;
    }
    if (Object.keys(pair).length > 0) {
      pairs.push({ id: reference.id, attributes: pair });
    }
  }
  return {
    dimensions: Array.from(dimensions, ([name, values]) => ({
      name,
      kind: dimensionKind(name),
      optionCount: values.size,
      options: Array.from(values),
    })),
    pairCount: pairs.length,
    samplePairs: pairs.slice(0, 12),
  };
}

function idSet(items) {
  return new Set(items.map((item) => Number(item.id)).filter(Number.isInteger));
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(
    `Usage:\n  node --env-file=.env.local scripts/diagnose-product-variations.mjs --slug=esim-chau-a-11-nuoc\n\nOptions:\n  --slug=<slug>\n  --base-url=<https://shop.example>\n  --output=<path>`,
  );
  process.exit(0);
}

const slug = nonEmptyString(args.slug) || "esim-chau-a-11-nuoc";
const configuredBaseUrl =
  nonEmptyString(args["base-url"]) ||
  nonEmptyString(process.env.NEXT_PUBLIC_WOOCOMMERCE_URL);
if (!configuredBaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_WOOCOMMERCE_URL or --base-url=<shop URL>.",
  );
}

const storeApiBase = `${normalizeBaseUrl(configuredBaseUrl)}/wp-json/wc/store/v1`;

function isTopLevelProduct(product) {
  return (
    isRecord(product) &&
    product.type !== "variation" &&
    Number(product.parent || 0) === 0
  );
}

function productSummary(product) {
  if (!isRecord(product)) return null;
  return {
    id: Number(product.id),
    slug: nonEmptyString(product.slug) || "",
    type: nonEmptyString(product.type) || "",
    parent: Number(product.parent || 0),
  };
}

function selectExactTopLevelProduct(products, requestedSlug) {
  if (!Array.isArray(products)) return null;
  const exact = products.filter((item) => item?.slug === requestedSlug);
  return (
    exact.find((item) => item.type === "variable" && isTopLevelProduct(item)) ||
    exact.find((item) => isTopLevelProduct(item)) ||
    null
  );
}

async function fetchAllowNotFound(url) {
  try {
    return await fetchJson(url);
  } catch (error) {
    if (error?.status === 404) return null;
    throw error;
  }
}

async function fetchProductById(productId) {
  return fetchAllowNotFound(`${storeApiBase}/products/${productId}`);
}

async function resolveParentProduct(requestedSlug, explicitProductId) {
  const trace = {
    requestedSlug,
    explicitProductId: explicitProductId || null,
    directSlugResult: null,
    variableCandidates: [],
    broadCandidates: [],
    resolution: "unresolved",
  };

  if (explicitProductId) {
    const explicit = await fetchProductById(explicitProductId);
    if (!explicit) {
      throw new Error(`Product ID not found: ${explicitProductId}`);
    }
    if (!isTopLevelProduct(explicit)) {
      throw new Error(
        `Product ID ${explicitProductId} is not a top-level product (type=${explicit.type}, parent=${explicit.parent}).`,
      );
    }
    trace.resolution = "explicit-product-id";
    return { parent: explicit, trace };
  }

  const direct = await fetchAllowNotFound(
    `${storeApiBase}/products/${encodeURIComponent(requestedSlug)}`,
  );
  trace.directSlugResult = productSummary(direct);
  if (direct && direct.slug === requestedSlug && isTopLevelProduct(direct)) {
    trace.resolution = "single-product-by-slug";
    return { parent: direct, trace };
  }
  const directParentId = Number(direct?.parent || 0);
  if (directParentId > 0) {
    const parent = await fetchProductById(directParentId);
    if (parent && isTopLevelProduct(parent)) {
      trace.resolution = "single-slug-variation-parent";
      return { parent, trace };
    }
  }

  const variableQuery = new URLSearchParams({
    slug: requestedSlug,
    type: "variable",
    catalog_visibility: "any",
    per_page: "100",
  });
  const variableCandidates = await fetchJson(
    `${storeApiBase}/products?${variableQuery}`,
  );
  if (!Array.isArray(variableCandidates)) {
    throw new Error("Expected variable product query to return an array.");
  }
  trace.variableCandidates = variableCandidates.map(productSummary);
  const variableParent = selectExactTopLevelProduct(
    variableCandidates,
    requestedSlug,
  );
  if (variableParent) {
    trace.resolution = "variable-collection";
    return { parent: variableParent, trace };
  }

  const broadQuery = new URLSearchParams({
    slug: requestedSlug,
    catalog_visibility: "any",
    per_page: "100",
  });
  const broadCandidates = await fetchJson(
    `${storeApiBase}/products?${broadQuery}`,
  );
  if (!Array.isArray(broadCandidates)) {
    throw new Error("Expected broad product query to return an array.");
  }
  trace.broadCandidates = broadCandidates.map(productSummary);
  const topLevel = selectExactTopLevelProduct(broadCandidates, requestedSlug);
  if (topLevel) {
    trace.resolution = "broad-collection-top-level";
    return { parent: topLevel, trace };
  }

  const variation = broadCandidates.find(
    (item) =>
      item?.slug === requestedSlug &&
      (item.type === "variation" || Number(item.parent || 0) > 0),
  );
  const parentId = Number(variation?.parent || 0);
  if (parentId > 0) {
    const parent = await fetchProductById(parentId);
    if (parent && isTopLevelProduct(parent)) {
      trace.resolution = "broad-collection-variation-parent";
      return { parent, trace };
    }
  }

  throw new Error(`Top-level product not found for slug: ${requestedSlug}`);
}

const explicitProductId = Number(args["product-id"] || 0);
const { parent, trace: parentResolution } = await resolveParentProduct(
  slug,
  Number.isInteger(explicitProductId) && explicitProductId > 0
    ? explicitProductId
    : null,
);
const references = variationReferences(parent.variations);
const referenceIds = references.map((item) => item.id);
const defaultVisibilityVariations = await fetchPages(
  storeApiBase,
  `/products?type=variation&parent=${parent.id}`,
);
const anyVisibilityVariations = await fetchPages(
  storeApiBase,
  `/products?type=variation&parent=${parent.id}&catalog_visibility=any`,
);
const includeVariations = await fetchByReferenceIds(storeApiBase, referenceIds);
const referenceIdSet = new Set(referenceIds);
const defaultIds = idSet(defaultVisibilityVariations);
const anyIds = idSet(anyVisibilityVariations);
const includeIds = idSet(includeVariations);
const matrix = matrixFromReferences(references);

const report = {
  generatedAt: new Date().toISOString(),
  parentResolution,
  product: {
    id: parent.id,
    slug: parent.slug,
    name: parent.name,
    type: parent.type,
  },
  counts: {
    parentVariationReferences: references.length,
    referencesWithAttributes: references.filter((item) =>
      item.attributes.some((attribute) => attribute.value),
    ).length,
    defaultParentQueryProducts: defaultVisibilityVariations.length,
    anyVisibilityParentQueryProducts: anyVisibilityVariations.length,
    explicitIncludeProducts: includeVariations.length,
    defaultQueryMissingReferences: referenceIds.filter(
      (id) => !defaultIds.has(id),
    ).length,
    anyQueryMissingReferences: referenceIds.filter((id) => !anyIds.has(id))
      .length,
    includeQueryMissingReferences: referenceIds.filter(
      (id) => !includeIds.has(id),
    ).length,
    includeProductsOutsideParentReferences: includeVariations.filter(
      (item) => !referenceIdSet.has(Number(item.id)),
    ).length,
    includeProductsWithAdapterStyleAttributes: includeVariations.filter(
      (item) => fullVariationSelectedAttributeCount(item) > 0,
    ).length,
  },
  matrix,
  missingIds: {
    defaultParentQuery: referenceIds.filter((id) => !defaultIds.has(id)),
    anyVisibilityParentQuery: referenceIds.filter((id) => !anyIds.has(id)),
    explicitIncludeQuery: referenceIds.filter((id) => !includeIds.has(id)),
  },
  samples: {
    parentReferences: references.slice(0, 8),
    defaultParentQuery: defaultVisibilityVariations.slice(0, 5).map((item) => ({
      id: item.id,
      sku: item.sku,
      variation: item.variation,
      purchasable: item.is_purchasable,
      inStock: item.is_in_stock,
    })),
    explicitIncludeQuery: includeVariations.slice(0, 5).map((item) => ({
      id: item.id,
      sku: item.sku,
      variation: item.variation,
      purchasable: item.is_purchasable,
      inStock: item.is_in_stock,
    })),
  },
  conclusion:
    references.length > defaultVisibilityVariations.length &&
    includeVariations.length > defaultVisibilityVariations.length
      ? "The default parent variation collection omitted referenced variations. Fetch parent reference IDs explicitly with catalog_visibility=any."
      : includeVariations.length === references.length
        ? "Explicit variation ID retrieval covers every parent reference."
        : "Some referenced variations are still unavailable through the public Store API; inspect publication, price and visibility for the missing IDs.",
};

const timestamp = report.generatedAt.replace(/[:.]/g, "-");
const output =
  nonEmptyString(args.output) ||
  path.join(
    "artifacts",
    `product-variation-diagnostic-${slug}-${timestamp}.json`,
  );
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`Requested slug: ${slug}`);
if (parentResolution.directSlugResult) {
  const direct = parentResolution.directSlugResult;
  console.log(
    `Direct slug result: ${direct.id} ${direct.type || "unknown"} parent=${direct.parent}`,
  );
}
console.log(`Resolved parent: ${parent.id} ${parent.slug} (${parent.type})`);
console.log(`Resolution: ${parentResolution.resolution}`);
console.log(`Parent variation references: ${references.length}`);
console.log(
  `Default parent query: ${defaultVisibilityVariations.length} variation product(s)`,
);
console.log(
  `Parent query with catalog_visibility=any: ${anyVisibilityVariations.length} variation product(s)`,
);
console.log(
  `Explicit include query: ${includeVariations.length} variation product(s)`,
);
console.log(`Dimensions: ${matrix.dimensions.length}`);
for (const dimension of matrix.dimensions) {
  console.log(
    `  - ${dimension.name} (${dimension.kind}): ${dimension.optionCount} option(s)`,
  );
}
console.log(`Attribute pairs: ${matrix.pairCount}`);
console.log(`Report: ${output}`);

if (parent.type === "variable" && references.length === 0) {
  console.error(
    "FAIL: resolved a variable parent product but it exposes zero variation references.",
  );
  process.exitCode = 2;
} else if (includeVariations.length !== references.length) {
  console.error(
    `WARNING: ${references.length - includeVariations.length} parent reference(s) are unavailable through the Store API.`,
  );
  process.exitCode = 2;
} else {
  console.log(
    "PASS: every parent variation reference was retrieved explicitly.",
  );
}
