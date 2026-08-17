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

  // Product Family is the primary read model. WooCommerce remains an
  // emergency rollback source and is only queried if localization fails.
  return ["localization", "woocommerce"];
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
