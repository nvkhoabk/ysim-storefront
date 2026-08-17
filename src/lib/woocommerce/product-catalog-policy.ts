export type ProductCatalogSource =
  | "woocommerce"
  | "localization"
  | "hybrid";

export interface ProductFamilyRecord {
  readonly familyId: number;
  readonly familyCode: string;
  readonly requestedLocale: string;
  readonly resolvedLocale: string;
}

export type StorefrontProductLocale = "vi" | "en" | "lo";

export interface SkuFamilyMember {
  readonly id: number;
  readonly sku: string;
}

export interface SkuFamilyIdentity {
  readonly familyCode: string;
  readonly locale: StorefrontProductLocale;
  readonly suffix: "" | "VI" | "EN" | "LO" | "LA";
}

export interface WooCatalogFamilyMember extends SkuFamilyMember {
  readonly slug: string;
  readonly catalog_family_anchor_sku?: string;
}

export interface WooCatalogFamilyIdentity extends SkuFamilyIdentity {
  readonly derivation: "locale-suffix" | "numeric-copy" | "exact-sku";
}

const SKU_LOCALE_SUFFIX = /-(VI|EN|LO|LA)$/i;
const TERMINAL_NUMERIC_COPY_SUFFIX = /-\d+$/;
const TERMINAL_SLUG_LOCALE_SUFFIX = /-(VI|EN|LO|LA)$/i;

export function normalizeStorefrontProductLocale(
  value: string | undefined,
): StorefrontProductLocale {
  const locale = value?.trim().toLowerCase();
  if (locale === "en" || locale === "lo") {
    return locale;
  }
  return "vi";
}

/**
 * Existing WooCommerce translations share a commercial SKU prefix. Only an
 * exact, terminal locale suffix is removed; names and slugs never participate
 * in family identity.
 */
export function skuFamilyIdentity(
  skuValue: string | undefined,
): SkuFamilyIdentity | null {
  const sku = skuValue?.trim().toUpperCase() || "";
  if (!sku) {
    return null;
  }

  const match = SKU_LOCALE_SUFFIX.exec(sku);
  const suffix = (match?.[1]?.toUpperCase() || "") as
    SkuFamilyIdentity["suffix"];
  const familyCode = suffix
    ? sku.slice(0, -(suffix.length + 1))
    : sku;

  if (!familyCode) {
    return null;
  }

  return {
    familyCode,
    locale:
      suffix === "EN"
        ? "en"
        : suffix === "LO" || suffix === "LA"
          ? "lo"
          : "vi",
    suffix,
  };
}

function skuLocaleRank(
  identity: SkuFamilyIdentity,
  requestedLocale: StorefrontProductLocale,
): number {
  const suffix = identity.suffix;

  if (requestedLocale === "en") {
    if (suffix === "EN") return 0;
    if (suffix === "") return 1;
    if (suffix === "VI") return 2;
    if (suffix === "LO") return 3;
    return 4;
  }

  if (requestedLocale === "lo") {
    if (suffix === "LO") return 0;
    if (suffix === "LA") return 1;
    if (suffix === "") return 2;
    if (suffix === "VI") return 3;
    return 4;
  }

  if (suffix === "") return 0;
  if (suffix === "VI") return 1;
  if (suffix === "EN") return 2;
  if (suffix === "LO") return 3;
  return 4;
}

function productSlugLocale(slugValue: string): StorefrontProductLocale {
  const slug = slugValue.trim();
  const suffix = TERMINAL_SLUG_LOCALE_SUFFIX.exec(slug)?.[1]?.toUpperCase();
  if (suffix === "EN") {
    return "en";
  }
  if (suffix === "LO" || suffix === "LA") {
    return "lo";
  }
  return "vi";
}

/**
 * Resolve the family identity exposed by the live Woo catalog.
 *
 * New records use explicit locale suffixes. Legacy translated copies instead
 * have a numeric copy suffix (for example -15, -31 and -36) on the parent or
 * first variation SKU. The numeric suffix is only a grouping candidate; the
 * selector below activates that grouping when the candidate spans multiple
 * locales. A terminal slug token is used solely to classify the localized
 * record and never contributes to familyCode.
 */
export function wooCatalogFamilyIdentity(
  item: WooCatalogFamilyMember,
): WooCatalogFamilyIdentity | null {
  const sku = (item.sku || item.catalog_family_anchor_sku || "")
    .trim()
    .toUpperCase();
  const explicit = skuFamilyIdentity(sku);
  if (!explicit) {
    return null;
  }

  if (explicit.suffix) {
    return { ...explicit, derivation: "locale-suffix" };
  }

  if (TERMINAL_NUMERIC_COPY_SUFFIX.test(explicit.familyCode)) {
    return {
      familyCode: explicit.familyCode.replace(
        TERMINAL_NUMERIC_COPY_SUFFIX,
        "",
      ),
      locale: productSlugLocale(item.slug),
      suffix: "",
      derivation: "numeric-copy",
    };
  }

  return {
    familyCode: explicit.familyCode,
    locale: productSlugLocale(item.slug),
    suffix: "",
    derivation: "exact-sku",
  };
}

function wooCatalogLocaleRank(
  identity: WooCatalogFamilyIdentity,
  requestedLocale: StorefrontProductLocale,
): number {
  if (identity.derivation === "locale-suffix") {
    return skuLocaleRank(identity, requestedLocale);
  }

  if (identity.locale === requestedLocale) {
    return 0;
  }
  if (identity.locale === "vi") {
    return 1;
  }
  return identity.locale === "en" ? 2 : 3;
}

/**
 * Select one top-level Woo product per commercial family. Numeric legacy
 * stems are grouped only when at least two locale cohorts are present, which
 * prevents unrelated same-locale products from being collapsed accidentally.
 */
export function selectWooCatalogFamilyMembers<
  T extends WooCatalogFamilyMember,
>(items: readonly T[], localeValue: string | undefined): T[] {
  const requestedLocale = normalizeStorefrontProductLocale(localeValue);
  const entries = items.map((item, order) => ({
    item,
    order,
    identity: wooCatalogFamilyIdentity(item),
  }));
  const numericLocales = new Map<string, Set<StorefrontProductLocale>>();

  for (const entry of entries) {
    if (entry.identity?.derivation !== "numeric-copy") {
      continue;
    }
    const locales =
      numericLocales.get(entry.identity.familyCode) ??
      new Set<StorefrontProductLocale>();
    locales.add(entry.identity.locale);
    numericLocales.set(entry.identity.familyCode, locales);
  }

  const selected = new Map<
    string,
    { readonly item: T; readonly rank: number; readonly order: number }
  >();

  for (const entry of entries) {
    const identity = entry.identity;
    const numericFamilyIsConfirmed =
      identity?.derivation === "numeric-copy" &&
      (numericLocales.get(identity.familyCode)?.size ?? 0) > 1;
    const key =
      identity &&
      (identity.derivation !== "numeric-copy" || numericFamilyIsConfirmed)
        ? `sku:${identity.familyCode}`
        : `id:${entry.item.id}`;
    const rank = identity
      ? wooCatalogLocaleRank(identity, requestedLocale)
      : 0;
    const current = selected.get(key);

    if (!current || rank < current.rank) {
      selected.set(key, {
        item: entry.item,
        rank,
        order: current?.order ?? entry.order,
      });
    }
  }

  return Array.from(selected.values())
    .sort((left, right) => left.order - right.order)
    .map((entry) => entry.item);
}

/**
 * Select exactly one localized WooCommerce record per canonical SKU family.
 * Empty-SKU records remain independent by product ID so the storefront never
 * fabricates a family relationship from translated display content.
 */
export function selectSkuFamilyMembers<T extends SkuFamilyMember>(
  items: readonly T[],
  localeValue: string | undefined,
): T[] {
  const requestedLocale = normalizeStorefrontProductLocale(localeValue);
  const selected = new Map<
    string,
    { readonly item: T; readonly rank: number; readonly order: number }
  >();

  items.forEach((item, order) => {
    const identity = skuFamilyIdentity(item.sku);
    const key = identity
      ? `sku:${identity.familyCode}`
      : `id:${item.id}`;
    const rank = identity
      ? skuLocaleRank(identity, requestedLocale)
      : 0;
    const current = selected.get(key);

    if (!current || rank < current.rank) {
      selected.set(key, { item, rank, order: current?.order ?? order });
    }
  });

  return Array.from(selected.values())
    .sort((left, right) => left.order - right.order)
    .map((entry) => entry.item);
}

export function resolveProductCatalogSource(
  value: string | undefined,
): ProductCatalogSource {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "woocommerce" || normalized === "localization") {
    return normalized;
  }

  return "hybrid";
}

export function productCatalogAttemptOrder(
  source: ProductCatalogSource,
): readonly ("localization" | "woocommerce")[] {
  if (source === "woocommerce") {
    return ["woocommerce"];
  }

  if (source === "localization") {
    return ["localization"];
  }

  // WooCommerce is complete today and its SKU suffix contract provides the
  // canonical family boundary. The Localization API remains available as a
  // fallback until its catalog coverage reaches parity.
  return ["woocommerce", "localization"];
}

export function canonicalProductFamilyKey(
  item: Pick<ProductFamilyRecord, "familyId" | "familyCode">,
): string {
  if (Number.isInteger(item.familyId) && item.familyId > 0) {
    return `id:${item.familyId}`;
  }

  const code = item.familyCode.trim().toUpperCase();
  if (!code) {
    throw new Error("PRODUCT_FAMILY_IDENTITY_MISSING");
  }

  return `code:${code}`;
}

/**
 * Keep exactly one localized record for each explicit family identity.
 * Names and slugs are intentionally excluded from the grouping key.
 */
export function dedupeProductFamilies<T extends ProductFamilyRecord>(
  items: readonly T[],
): T[] {
  const byFamily = new Map<string, T>();

  for (const item of items) {
    const key = canonicalProductFamilyKey(item);
    const current = byFamily.get(key);

    if (!current) {
      byFamily.set(key, item);
      continue;
    }

    const itemIsExactLocale = item.resolvedLocale === item.requestedLocale;
    const currentIsExactLocale =
      current.resolvedLocale === current.requestedLocale;

    if (itemIsExactLocale && !currentIsExactLocale) {
      byFamily.set(key, item);
    }
  }

  return Array.from(byFamily.values());
}
