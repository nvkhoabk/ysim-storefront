import type { ProductDetailVariationViewModel } from "@/types/view-models/product-detail-route-candidate";

export interface ProductDetailVariantOption {
  value: string;
  label: string;
}

export interface ProductDetailVariantDimension {
  key: string;
  label: string;
  kind: "capacity" | "duration" | "other";
  options: readonly ProductDetailVariantOption[];
}

export interface ProductDetailVariantMatrix {
  dimensions: readonly ProductDetailVariantDimension[];
  primaryDimensions: readonly ProductDetailVariantDimension[];
}

const capacitySignals = [
  "data-amount",
  "data_amount",
  "capacity",
  "allowance",
  "data",
  "dung-luong",
  "dung lượng",
  "dung luong",
  "goi-data",
] as const;

const durationSignals = [
  "duration-days",
  "duration_days",
  "duration",
  "validity",
  "days",
  "day",
  "so-ngay",
  "số ngày",
  "so ngay",
  "thoi-han",
  "thời hạn",
  "thoi han",
] as const;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function includesSignal(value: string, signals: readonly string[]): boolean {
  const normalized = normalize(value);

  return signals.some((signal) => normalized.includes(normalize(signal)));
}

function dimensionKind(
  key: string,
  names: readonly string[],
): ProductDetailVariantDimension["kind"] {
  const combined = [key, ...names].join(" ");

  if (includesSignal(combined, capacitySignals)) {
    return "capacity";
  }

  if (includesSignal(combined, durationSignals)) {
    return "duration";
  }

  return "other";
}

function durationNumber(value: string): number | undefined {
  const match = value.match(/(\d+(?:[.,]\d+)?)/);

  if (!match) {
    return undefined;
  }

  const result = Number(match[1].replace(",", "."));

  return Number.isFinite(result) ? result : undefined;
}

function dataAmountNumber(value: string): number | undefined {
  const match = value.match(/(\d+(?:[.,]\d+)?)\s*(tb|gb|mb)/i);

  if (!match) {
    return undefined;
  }

  const amount = Number(match[1].replace(",", "."));

  const unit = match[2].toLowerCase();

  if (!Number.isFinite(amount)) {
    return undefined;
  }

  if (unit === "tb") {
    return amount * 1024 * 1024;
  }

  if (unit === "gb") {
    return amount * 1024;
  }

  return amount;
}

function optionSortValue(
  option: ProductDetailVariantOption,
  kind: ProductDetailVariantDimension["kind"],
): number | string {
  if (kind === "duration") {
    return durationNumber(option.label) ?? Number.MAX_SAFE_INTEGER;
  }

  if (kind === "capacity") {
    const normalized = normalize(option.label);

    if (
      normalized.includes("unlimited") ||
      normalized.includes("khong-gioi-han")
    ) {
      return Number.MAX_SAFE_INTEGER;
    }

    return dataAmountNumber(option.label) ?? Number.MAX_SAFE_INTEGER - 1;
  }

  return option.label;
}

function sortOptions(
  options: readonly ProductDetailVariantOption[],
  kind: ProductDetailVariantDimension["kind"],
): readonly ProductDetailVariantOption[] {
  return [...options].sort((left, right) => {
    const leftValue = optionSortValue(left, kind);

    const rightValue = optionSortValue(right, kind);

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return leftValue - rightValue;
    }

    return String(leftValue).localeCompare(String(rightValue), "vi");
  });
}

export function createProductDetailVariantMatrix(
  variations: readonly ProductDetailVariationViewModel[],
): ProductDetailVariantMatrix {
  const keys = Array.from(
    new Set(
      variations.flatMap((variation) => Object.keys(variation.attributes)),
    ),
  );

  const dimensions = keys
    .map((key): ProductDetailVariantDimension => {
      const names = variations
        .map((variation) => variation.attributeNames[key])
        .filter((value): value is string => Boolean(value));

      const kind = dimensionKind(key, names);

      const labelsByValue = new Map<string, string>();

      for (const variation of variations) {
        const value = variation.attributes[key];

        if (!value) {
          continue;
        }

        labelsByValue.set(value, variation.attributeLabels[key] || value);
      }

      const options = sortOptions(
        Array.from(labelsByValue, ([value, label]) => ({
          value,
          label,
        })),
        kind,
      );

      const label =
        kind === "capacity"
          ? "Dung lượng"
          : kind === "duration"
            ? "Số ngày"
            : names[0] || key;

      return {
        key,
        label,
        kind,
        options,
      };
    })
    .filter((dimension) => dimension.options.length > 1);

  const capacity = dimensions.find(
    (dimension) => dimension.kind === "capacity",
  );

  const duration = dimensions.find(
    (dimension) => dimension.kind === "duration",
  );

  const primaryDimensions = [
    capacity,
    duration,
    ...dimensions.filter(
      (dimension) => dimension !== capacity && dimension !== duration,
    ),
  ]
    .filter((dimension): dimension is ProductDetailVariantDimension =>
      Boolean(dimension),
    )
    .slice(0, 2);

  return {
    dimensions,
    primaryDimensions,
  };
}

export function variationMatchesSelection(
  variation: ProductDetailVariationViewModel,
  selection: Readonly<Record<string, string>>,
): boolean {
  return Object.entries(selection).every(
    ([key, value]) => !value || variation.attributes[key] === value,
  );
}

export function findSelectedProductVariation(
  variations: readonly ProductDetailVariationViewModel[],
  selection: Readonly<Record<string, string>>,
): ProductDetailVariationViewModel | undefined {
  return (
    variations.find(
      (variation) =>
        variationMatchesSelection(variation, selection) &&
        variation.purchasable &&
        variation.inStock,
    ) ||
    variations.find((variation) =>
      variationMatchesSelection(variation, selection),
    )
  );
}

export function isProductVariantOptionAvailable({
  variations,
  dimensionKey,
  optionValue,
}: {
  variations: readonly ProductDetailVariationViewModel[];
  selection: Readonly<Record<string, string>>;
  dimensionKey: string;
  optionValue: string;
}): boolean {
  // An option is selectable when at least one purchasable variation uses it.
  // reconcileProductVariantSelection will update the other dimension when the
  // current pair is sparse or unavailable.
  return variations.some(
    (variation) =>
      variation.attributes[dimensionKey] === optionValue &&
      variation.purchasable &&
      variation.inStock,
  );
}

export function createInitialProductVariantSelection({
  variations,
  defaultVariationId,
  dimensions,
}: {
  variations: readonly ProductDetailVariationViewModel[];
  defaultVariationId?: number;
  dimensions: readonly ProductDetailVariantDimension[];
}): Readonly<Record<string, string>> {
  const preferred =
    variations.find((variation) => variation.id === defaultVariationId) ||
    variations.find(
      (variation) => variation.purchasable && variation.inStock,
    ) ||
    variations[0];

  return Object.fromEntries(
    dimensions.map((dimension) => [
      dimension.key,
      preferred?.attributes[dimension.key] || dimension.options[0]?.value || "",
    ]),
  );
}

export function reconcileProductVariantSelection({
  variations,
  dimensions,
  selection,
  changedDimensionKey,
}: {
  variations: readonly ProductDetailVariationViewModel[];
  dimensions: readonly ProductDetailVariantDimension[];
  selection: Readonly<Record<string, string>>;
  changedDimensionKey: string;
}): Readonly<Record<string, string>> {
  const direct = findSelectedProductVariation(variations, selection);

  if (direct?.purchasable && direct.inStock) {
    return selection;
  }

  const changedValue = selection[changedDimensionKey];

  const compatible = variations.find(
    (variation) =>
      variation.attributes[changedDimensionKey] === changedValue &&
      variation.purchasable &&
      variation.inStock,
  );

  if (!compatible) {
    return selection;
  }

  return Object.fromEntries(
    dimensions.map((dimension) => [
      dimension.key,
      compatible.attributes[dimension.key] || selection[dimension.key] || "",
    ]),
  );
}
