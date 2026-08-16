import { esimDestinationExplorer } from "@/config/esim-destination-explorer";
import type { WooCommerceProduct } from "@/lib/woocommerce/types";
import type { WooCommerceStoreCategorySource } from "@/types/view-models/home-production";
import type { DestinationContinentKey } from "@/types/view-models/destination-page";

export type DestinationContinent = Exclude<DestinationContinentKey, "all">;

export interface DestinationDescriptor {
  canonicalSlug: string;
  label: string;
  countryCode?: string;
  continent: DestinationContinent;
  continentLabel: string;
  aliases: readonly string[];
}

export interface WooCategoryTaxonomy {
  readonly categories: readonly WooCommerceStoreCategorySource[];
  readonly byId: ReadonlyMap<number, WooCommerceStoreCategorySource>;
  readonly childrenByParent: ReadonlyMap<number, readonly WooCommerceStoreCategorySource[]>;
  canonicalDestinationSlug(value: string | undefined): string | undefined;
  destinationDescriptor(value: string | undefined): DestinationDescriptor | undefined;
  categoryDescriptor(category: Pick<WooCommerceStoreCategorySource, "id" | "name" | "slug" | "parent">): DestinationDescriptor;
  ancestorCategories(categoryId: number): readonly WooCommerceStoreCategorySource[];
  categoryContinent(categoryId: number): { key: DestinationContinent; label: string };
  isStructuralCategory(category: Pick<WooCommerceStoreCategorySource, "id" | "name" | "slug" | "parent">): boolean;
  isDestinationCategory(category: Pick<WooCommerceStoreCategorySource, "id" | "name" | "slug" | "parent">): boolean;
}

interface DestinationDefinitionSeed {
  canonicalSlug: string;
  label: string;
  countryCode?: string;
  continent: DestinationContinent;
  continentLabel: string;
  aliases: readonly string[];
}

const canonicalSlugOverrides: Readonly<Record<string, string>> = {
  "south-korea": "korea",
  "united-states": "usa",
};

const explicitAliasTargets: Readonly<Record<string, string>> = {
  "han quoc": "korea",
  korea: "korea",
  kr: "korea",
  "south korea": "korea",
  "south-korea": "korea",
  my: "usa",
  "hoa ky": "usa",
  us: "usa",
  usa: "usa",
  "united states": "usa",
  "united-states": "usa",
  "tieu vuong quoc a rap thong nhat": "uae",
  "united arab emirates": "uae",
  dubai: "uae",
  uae: "uae",
};

const explicitCountryCodes: Readonly<Record<string, string>> = {
  argentina: "ar",
  australia: "au",
  austria: "at",
  bangladesh: "bd",
  belgium: "be",
  brazil: "br",
  brunei: "bn",
  bulgaria: "bg",
  cambodia: "kh",
  canada: "ca",
  chile: "cl",
  china: "cn",
  colombia: "co",
  "costa-rica": "cr",
  croatia: "hr",
  cyprus: "cy",
  czech: "cz",
  denmark: "dk",
  ecuador: "ec",
  estonia: "ee",
  finland: "fi",
  france: "fr",
  germany: "de",
  greece: "gr",
  "hong-kong": "hk",
  hungary: "hu",
  iceland: "is",
  india: "in",
  indonesia: "id",
  ireland: "ie",
  italy: "it",
  japan: "jp",
  korea: "kr",
  laos: "la",
  macau: "mo",
  malaysia: "my",
  mexico: "mx",
  myanmar: "mm",
  netherlands: "nl",
  "new-zealand": "nz",
  norway: "no",
  panama: "pa",
  peru: "pe",
  philippines: "ph",
  poland: "pl",
  portugal: "pt",
  russia: "ru",
  singapore: "sg",
  spain: "es",
  sweden: "se",
  switzerland: "ch",
  taiwan: "tw",
  thailand: "th",
  "timor-leste": "tl",
  turkey: "tr",
  uae: "ae",
  "united-kingdom": "gb",
  uruguay: "uy",
  usa: "us",
  vietnam: "vn",
};

const continentLabels: Readonly<Record<DestinationContinent, string>> = {
  asia: "Châu Á",
  europe: "Châu Âu",
  "north-america": "Bắc Mỹ",
  "south-america": "Nam Mỹ",
  africa: "Châu Phi",
  oceania: "Châu Đại Dương",
  global: "Toàn cầu",
};

const structuralSlugs = new Set([
  "asia",
  "europe-region",
  "north-america",
  "south-america",
  "africa",
  "oceania",
  "multi-region",
  "uncategorized",
  "products",
  "product",
  "esim",
]);

const genericCategoryAliases = new Set([
  "esim",
  "esim du lich",
  "travel esim",
  "san pham",
  "products",
  "product",
  "uncategorized",
]);

export function normalizeCategoryToken(value: string | undefined): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function slugify(value: string | undefined): string {
  return normalizeCategoryToken(value).replace(/\s+/g, "-");
}

function unique(values: readonly (string | undefined)[]): readonly string[] {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim())),
  );
}

function explorerDefinitions(): readonly DestinationDefinitionSeed[] {
  return [...esimDestinationExplorer.primaryContinents, ...esimDestinationExplorer.secondaryContinents]
    .flatMap((continent) =>
      continent.destinations.map((destination) => {
        const canonicalSlug = canonicalSlugOverrides[destination.slug] || destination.slug;
        const continentKey: DestinationContinent = destination.slug === "global"
          ? "global"
          : continent.id === "special"
            ? "global"
            : (continent.id as DestinationContinent);

        return {
          canonicalSlug,
          label: destination.label,
          countryCode: destination.countryCode,
          continent: continentKey,
          continentLabel: continentKey === "global" ? continentLabels.global : continent.label,
          aliases: unique([
            canonicalSlug,
            destination.slug,
            destination.label,
            destination.countryCode,
          ]),
        };
      }),
    );
}

const seededDefinitions = explorerDefinitions();
const descriptorsByCanonical = new Map<string, DestinationDescriptor>();
const canonicalByAlias = new Map<string, string>();

for (const seed of seededDefinitions) {
  const descriptor: DestinationDescriptor = {
    ...seed,
    aliases: unique(seed.aliases),
  };
  descriptorsByCanonical.set(seed.canonicalSlug, descriptor);
  for (const alias of descriptor.aliases) {
    canonicalByAlias.set(normalizeCategoryToken(alias), descriptor.canonicalSlug);
  }
}

for (const [alias, target] of Object.entries(explicitAliasTargets)) {
  canonicalByAlias.set(normalizeCategoryToken(alias), target);
}

function canonicalFromKnownAlias(value: string | undefined): string | undefined {
  const normalized = normalizeCategoryToken(value);
  if (!normalized) {
    return undefined;
  }
  return canonicalByAlias.get(normalized) || canonicalByAlias.get(normalized.replace(/\s+/g, "-"));
}

function inferContinentFromSlug(slug: string): DestinationContinent {
  if (slug === "global") {
    return "global";
  }
  return "global";
}

function fallbackDescriptor(value: string | undefined): DestinationDescriptor | undefined {
  const canonicalSlug = slugify(value);
  if (!canonicalSlug) {
    return undefined;
  }
  const known = descriptorsByCanonical.get(canonicalSlug);
  if (known) {
    return known;
  }
  return {
    canonicalSlug,
    label: value?.trim() || canonicalSlug,
    countryCode: explicitCountryCodes[canonicalSlug],
    continent: inferContinentFromSlug(canonicalSlug),
    continentLabel: continentLabels.global,
    aliases: unique([canonicalSlug, value]),
  };
}

function categoryParentChain(
  categoryId: number,
  byId: ReadonlyMap<number, WooCommerceStoreCategorySource>,
): readonly WooCommerceStoreCategorySource[] {
  const result: WooCommerceStoreCategorySource[] = [];
  const visited = new Set<number>();
  let current = byId.get(categoryId);

  while (current?.parent && !visited.has(current.parent)) {
    visited.add(current.parent);
    const parent = byId.get(current.parent);
    if (!parent) {
      break;
    }
    result.push(parent);
    current = parent;
  }

  return result;
}

function continentFromCategories(
  category: Pick<WooCommerceStoreCategorySource, "id" | "slug">,
  byId: ReadonlyMap<number, WooCommerceStoreCategorySource>,
): { key: DestinationContinent; label: string } {
  const candidates = [category.slug, ...categoryParentChain(category.id, byId).map((item) => item.slug)];
  for (const rawSlug of candidates) {
    const slug = slugify(rawSlug);
    if (slug === "asia") {
      return { key: "asia", label: continentLabels.asia };
    }
    if (slug === "europe" || slug === "europe-region") {
      return { key: "europe", label: continentLabels.europe };
    }
    if (slug === "north-america") {
      return { key: "north-america", label: continentLabels["north-america"] };
    }
    if (slug === "south-america") {
      return { key: "south-america", label: continentLabels["south-america"] };
    }
    if (slug === "africa") {
      return { key: "africa", label: continentLabels.africa };
    }
    if (slug === "oceania") {
      return { key: "oceania", label: continentLabels.oceania };
    }
    if (slug === "global" || slug === "multi-region") {
      return { key: "global", label: continentLabels.global };
    }
  }
  return { key: "global", label: continentLabels.global };
}

export function canonicalDestinationSlug(value: string | undefined): string | undefined {
  return canonicalFromKnownAlias(value) || fallbackDescriptor(value)?.canonicalSlug;
}

export function createWooCategoryTaxonomy(
  categories: readonly WooCommerceStoreCategorySource[] = [],
): WooCategoryTaxonomy {
  const byId = new Map(categories.map((category) => [category.id, category] as const));
  const childrenByParentMutable = new Map<number, WooCommerceStoreCategorySource[]>();
  for (const category of categories) {
    const children = childrenByParentMutable.get(category.parent) || [];
    children.push(category);
    childrenByParentMutable.set(category.parent, children);
  }
  const childrenByParent = new Map<number, readonly WooCommerceStoreCategorySource[]>(childrenByParentMutable);

  function destinationDescriptor(value: string | undefined): DestinationDescriptor | undefined {
    const canonicalSlug = canonicalFromKnownAlias(value) || slugify(value);
    if (!canonicalSlug) {
      return undefined;
    }
    return descriptorsByCanonical.get(canonicalSlug) || fallbackDescriptor(value);
  }

  function categoryDescriptor(
    category: Pick<WooCommerceStoreCategorySource, "id" | "name" | "slug" | "parent">,
  ): DestinationDescriptor {
    const canonicalSlug = canonicalFromKnownAlias(category.slug)
      || canonicalFromKnownAlias(category.name)
      || slugify(category.slug || category.name);
    const seeded = canonicalSlug ? descriptorsByCanonical.get(canonicalSlug) : undefined;
    const continent = continentFromCategories(category, byId);
    return {
      canonicalSlug: canonicalSlug || `category-${category.id}`,
      label: seeded?.label || category.name,
      countryCode: seeded?.countryCode || explicitCountryCodes[canonicalSlug || ""],
      continent: seeded?.continent === "global" && continent.key !== "global"
        ? continent.key
        : (seeded?.continent || continent.key),
      continentLabel: seeded?.continent === "global" && continent.key !== "global"
        ? continent.label
        : (seeded?.continentLabel || continent.label),
      aliases: unique([
        category.slug,
        category.name,
        canonicalSlug,
        seeded?.countryCode,
        ...(seeded?.aliases || []),
      ]),
    };
  }

  function isStructuralCategory(
    category: Pick<WooCommerceStoreCategorySource, "id" | "name" | "slug" | "parent">,
  ): boolean {
    const slug = slugify(category.slug || category.name);
    if (structuralSlugs.has(slug)) {
      return true;
    }
    return genericCategoryAliases.has(normalizeCategoryToken(category.slug))
      || genericCategoryAliases.has(normalizeCategoryToken(category.name));
  }

  function isDestinationCategory(
    category: Pick<WooCommerceStoreCategorySource, "id" | "name" | "slug" | "parent">,
  ): boolean {
    if (isStructuralCategory(category)) {
      return false;
    }
    const canonical = categoryDescriptor(category).canonicalSlug;
    if (canonical === "global" || canonical === "europe" || canonical === "uae") {
      return true;
    }
    const hasChildren = (childrenByParent.get(category.id)?.length || 0) > 0;
    return !hasChildren || descriptorsByCanonical.has(canonical) || Boolean(explicitCountryCodes[canonical]);
  }

  return {
    categories,
    byId,
    childrenByParent,
    canonicalDestinationSlug(value) {
      return destinationDescriptor(value)?.canonicalSlug;
    },
    destinationDescriptor,
    categoryDescriptor,
    ancestorCategories(categoryId) {
      return categoryParentChain(categoryId, byId);
    },
    categoryContinent(categoryId) {
      const category = byId.get(categoryId);
      return category ? continentFromCategories(category, byId) : { key: "global", label: continentLabels.global };
    },
    isStructuralCategory,
    isDestinationCategory,
  };
}

function productCategoryDescriptors(
  product: WooCommerceProduct,
  taxonomy: WooCategoryTaxonomy,
): readonly DestinationDescriptor[] {
  return (product.categories || [])
    .map((category) => {
      const source = taxonomy.byId.get(category.id);
      return taxonomy.categoryDescriptor({
        id: category.id,
        name: category.name,
        slug: category.slug,
        parent: source?.parent || 0,
      });
    });
}

function categoryIsDestinationEvidence(
  category: NonNullable<WooCommerceProduct["categories"]>[number],
  taxonomy: WooCategoryTaxonomy,
): boolean {
  const source = taxonomy.byId.get(category.id);
  return taxonomy.isDestinationCategory({
    id: category.id,
    name: category.name,
    slug: category.slug,
    parent: source?.parent || 0,
  });
}

export function productDestinationDescriptors(
  product: WooCommerceProduct,
  taxonomy: WooCategoryTaxonomy = createWooCategoryTaxonomy(),
): readonly DestinationDescriptor[] {
  const byCanonical = new Map<string, DestinationDescriptor>();
  for (const [index, descriptor] of productCategoryDescriptors(product, taxonomy).entries()) {
    const category = product.categories?.[index];
    if (!category || !categoryIsDestinationEvidence(category, taxonomy)) {
      continue;
    }
    byCanonical.set(descriptor.canonicalSlug, descriptor);
  }
  return Array.from(byCanonical.values());
}

export function productDestinationSlugs(
  product: WooCommerceProduct,
  taxonomy: WooCategoryTaxonomy = createWooCategoryTaxonomy(),
): readonly string[] {
  return productDestinationDescriptors(product, taxonomy).map((descriptor) => descriptor.canonicalSlug);
}

function productCategorySlugs(
  product: WooCommerceProduct,
  taxonomy: WooCategoryTaxonomy,
): ReadonlySet<string> {
  const result = new Set<string>();
  for (const category of product.categories || []) {
    result.add(slugify(category.slug));
    result.add(taxonomy.categoryDescriptor({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parent: taxonomy.byId.get(category.id)?.parent || 0,
    }).canonicalSlug);
    for (const ancestor of taxonomy.ancestorCategories(category.id)) {
      result.add(slugify(ancestor.slug));
      result.add(taxonomy.categoryDescriptor(ancestor).canonicalSlug);
    }
  }
  return result;
}

export function productMatchesDestination(
  product: WooCommerceProduct,
  destination: string | undefined,
  taxonomy: WooCategoryTaxonomy = createWooCategoryTaxonomy(),
): boolean {
  if (!destination?.trim()) {
    return true;
  }
  const canonical = taxonomy.canonicalDestinationSlug(destination) || slugify(destination);
  const categorySlugs = productCategorySlugs(product, taxonomy);
  if (categorySlugs.has(canonical) || categorySlugs.has(slugify(destination))) {
    return true;
  }

  // Legacy fallback only: destination_code is allowed to help when a product has
  // no usable category evidence. It must never override valid Woo categories.
  if ((product.categories || []).length > 0) {
    return false;
  }
  return (product.attributes || []).some((attribute) => {
    const attributeKey = normalizeCategoryToken(attribute.taxonomy || attribute.name).replace(/\s+/g, "_");
    if (attributeKey !== "destination_code") {
      return false;
    }
    return (attribute.terms || []).some((term) =>
      (taxonomy.canonicalDestinationSlug(term.slug || term.name) || slugify(term.slug || term.name)) === canonical,
    );
  });
}

export function productMatchesCategory(
  product: WooCommerceProduct,
  category: string | undefined,
  taxonomy: WooCategoryTaxonomy = createWooCategoryTaxonomy(),
): boolean {
  if (!category?.trim()) {
    return true;
  }
  if (/^\d+$/.test(category.trim())) {
    return (product.categories || []).some((item) => item.id === Number(category));
  }
  return productMatchesDestination(product, category, taxonomy);
}
