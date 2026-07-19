"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  AddToCartButton,
} from "@/components/cart/AddToCartButton";

import {
  formatWooCommercePrice,
} from "@/lib/currency";

import type {
  WooCommerceProduct,
  WooCommerceProductAttribute,
  WooCommerceProductVariation,
} from "@/lib/woocommerce/types";

interface VariableProductPurchaseProps {
  product: WooCommerceProduct;
}

type SelectedAttributes =
  Record<string, string>;

/**
 * Chuẩn hóa slug/key thuộc tính:
 *
 * attribute_pa_dung-luong
 * pa_dung-luong
 * pa-dung-luong
 *
 * đều trở thành:
 *
 * pa-dung-luong
 */
function normalizeAttributeKey(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/^attribute[_-]/, "")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Chuẩn hóa giá trị:
 *
 * 2GB/ngày
 * 2GB/ ngày
 * 2gb-ngay
 *
 * đều trở thành:
 *
 * 2gb-ngay
 */
function normalizeAttributeValue(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getParentAttributeKey(
  attribute: WooCommerceProductAttribute,
): string {
  return normalizeAttributeKey(
    attribute.taxonomy?.trim() ||
      attribute.name.trim(),
  );
}

function buildAttributeKeyAliases(
  value: string,
): string[] {
  const normalized =
    normalizeAttributeKey(value);

  const withoutPa =
    normalized.replace(/^pa-/, "");

  return Array.from(
    new Set([
      normalized,
      withoutPa,
      `pa-${withoutPa}`,
    ]),
  );
}

function attributeKeysMatch(
  left: string,
  right: string,
): boolean {
  const leftAliases =
    buildAttributeKeyAliases(left);

  const rightAliases =
    buildAttributeKeyAliases(right);

  return leftAliases.some(
    (alias) =>
      rightAliases.includes(alias),
  );
}

function normalizeDefaultAttributes(
  defaults:
    | Record<string, string>
    | undefined,
  variationAttributes:
    WooCommerceProductAttribute[],
): SelectedAttributes {
  if (!defaults) {
    return {};
  }

  const normalizedDefaults:
    SelectedAttributes = {};

  for (
    const attribute
    of variationAttributes
  ) {
    const parentKey =
      getParentAttributeKey(attribute);

    const matchedEntry =
      Object.entries(defaults).find(
        ([defaultKey]) =>
          attributeKeysMatch(
            defaultKey,
            parentKey,
          ),
      );

    if (!matchedEntry) {
      continue;
    }

    const [, defaultValue] =
      matchedEntry;

    if (!defaultValue) {
      continue;
    }

    normalizedDefaults[parentKey] =
      normalizeAttributeValue(
        defaultValue,
      );
  }

  return normalizedDefaults;
}

function getVariationAttribute(
  variation: WooCommerceProductVariation,
  parentAttributeKey: string,
) {
  return variation.attributes.find(
    (attribute) =>
      attributeKeysMatch(
        attribute.slug,
        parentAttributeKey,
      ) ||
      attributeKeysMatch(
        attribute.name,
        parentAttributeKey,
      ),
  );
}

function variationValueMatches(
  variation:
    WooCommerceProductVariation,
  parentAttributeKey: string,
  selectedValue: string,
): boolean {
  const variationAttribute =
    getVariationAttribute(
      variation,
      parentAttributeKey,
    );

  if (!variationAttribute) {
    return false;
  }

  /*
   * Value rỗng là variation kiểu "Any value".
   */
  if (
    !variationAttribute.value?.trim()
  ) {
    return true;
  }

  const normalizedSelectedValue =
    normalizeAttributeValue(
      selectedValue,
    );

  const normalizedVariationValue =
    normalizeAttributeValue(
      variationAttribute.value,
    );

  const normalizedVariationLabel =
    normalizeAttributeValue(
      variationAttribute.label ||
        "",
    );

  return (
    normalizedVariationValue ===
      normalizedSelectedValue ||
    normalizedVariationLabel ===
      normalizedSelectedValue
  );
}

/**
 * Chỉ kiểm tra những thuộc tính thực sự dùng
 * để tạo variation.
 *
 * Không duyệt toàn bộ selected, vì defaultAttributes
 * có thể chứa khóa cũ hoặc thuộc tính không còn dùng.
 */
function variationMatchesSelection(
  variation:
    WooCommerceProductVariation,
  variationAttributes:
    WooCommerceProductAttribute[],
  selected: SelectedAttributes,
): boolean {
  return variationAttributes.every(
    (attribute) => {
      const parentKey =
        getParentAttributeKey(
          attribute,
        );

      const selectedValue =
        selected[parentKey];

      if (!selectedValue) {
        return false;
      }

      return variationValueMatches(
        variation,
        parentKey,
        selectedValue,
      );
    },
  );
}

function isSelectionComplete(
  variationAttributes:
    WooCommerceProductAttribute[],
  selected: SelectedAttributes,
): boolean {
  return variationAttributes.every(
    (attribute) => {
      const parentKey =
        getParentAttributeKey(
          attribute,
        );

      return Boolean(
        selected[parentKey],
      );
    },
  );
}

function findExactVariation(
  variations:
    WooCommerceProductVariation[],
  variationAttributes:
    WooCommerceProductAttribute[],
  selected: SelectedAttributes,
): WooCommerceProductVariation | null {
  if (
    !isSelectionComplete(
      variationAttributes,
      selected,
    )
  ) {
    return null;
  }

  return (
    variations.find(
      (variation) =>
        variation.is_purchasable &&
        variation.is_in_stock &&
        variationMatchesSelection(
          variation,
          variationAttributes,
          selected,
        ),
    ) ?? null
  );
}

function createVariationPayload(
  variation:
    WooCommerceProductVariation | null,
): Array<{
  attribute: string;
  value: string;
}> {
  if (!variation) {
    return [];
  }

  /*
   * Dùng nguyên slug/value mà WooCommerce trả về.
   * Không gửi giá trị đã normalize vào Cart API.
   */
  return variation.attributes.map(
    (attribute) => ({
      attribute:
        attribute.slug,

      value:
        attribute.value,
    }),
  );
}

export function VariableProductPurchase({
  product,
}: VariableProductPurchaseProps) {
  const variationAttributes =
    useMemo(
      () =>
        (
          product.attributes ?? []
        ).filter(
          (attribute) =>
            attribute.has_variations,
        ),
      [product.attributes],
    );

  const variations =
    useMemo(
      () =>
        (
          product.variations ?? []
        ).filter(
          (variation) =>
            variation.is_purchasable &&
            variation.is_in_stock,
        ),
      [product.variations],
    );

  const initialSelection =
    useMemo(
      () =>
        normalizeDefaultAttributes(
          product.default_attributes,
          variationAttributes,
        ),
      [
        product.default_attributes,
        variationAttributes,
      ],
    );

  const [selected, setSelected] =
    useState<SelectedAttributes>(
      initialSelection,
    );

  const selectionComplete =
    useMemo(
      () =>
        isSelectionComplete(
          variationAttributes,
          selected,
        ),
      [
        variationAttributes,
        selected,
      ],
    );

  const selectedVariation =
    useMemo(
      () =>
        findExactVariation(
          variations,
          variationAttributes,
          selected,
        ),
      [
        variations,
        variationAttributes,
        selected,
      ],
    );

  const combinationUnavailable =
    selectionComplete &&
    selectedVariation === null;

  const variationPayload =
    useMemo(
      () =>
        createVariationPayload(
          selectedVariation,
        ),
      [selectedVariation],
    );

  function handleOptionSelect(
    attributeKey: string,
    optionValue: string,
  ): void {
    const normalizedKey =
      normalizeAttributeKey(
        attributeKey,
      );

    const normalizedValue =
      normalizeAttributeValue(
        optionValue,
      );

    setSelected(
      (current) => ({
        ...current,
        [normalizedKey]:
          normalizedValue,
      }),
    );
  }

  return (
    <div className="mt-6">
      <div className="space-y-5">
        {variationAttributes.map(
          (attribute) => {
            const attributeKey =
              getParentAttributeKey(
                attribute,
              );

            return (
              <fieldset
                key={attributeKey}
              >
                <legend className="mb-2 text-sm font-semibold text-slate-900">
                  {attribute.name}
                </legend>

                <div className="flex flex-wrap gap-2">
                  {attribute.terms.map(
                    (term) => {
                      const termValue =
                        normalizeAttributeValue(
                          term.slug ||
                            term.name,
                        );

                      const active =
                        selected[
                          attributeKey
                        ] === termValue;

                      return (
                        <button
                          key={
                            `${attributeKey}:${term.slug}`
                          }
                          type="button"
                          aria-pressed={
                            active
                          }
                          onClick={() =>
                            handleOptionSelect(
                              attributeKey,
                              term.slug ||
                                term.name,
                            )
                          }
                          className={[
                            "rounded-xl border px-4 py-2 text-sm font-medium transition",
                            active
                              ? "border-green-700 bg-green-50 text-green-800"
                              : "border-slate-200 bg-white text-slate-700 hover:border-green-300 hover:bg-green-50/40",
                          ].join(" ")}
                        >
                          {term.name}
                        </button>
                      );
                    },
                  )}
                </div>
              </fieldset>
            );
          },
        )}
      </div>

      <div className="mt-6 border-y border-slate-200 py-6">
        {selectedVariation ? (
          <>
            <p className="text-sm text-slate-500">
              Giá gói đã chọn
            </p>

            <p className="mt-1 text-3xl font-bold text-green-700">
              {formatWooCommercePrice(
                selectedVariation.prices,
              )}
            </p>

            {selectedVariation.sku ? (
              <p className="mt-2 text-xs text-slate-500">
                SKU:{" "}
                {selectedVariation.sku}
              </p>
            ) : null}
          </>
        ) : combinationUnavailable ? (
          <>
            <p className="text-sm font-semibold text-red-600">
              Không có gói phù hợp
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Hiện chưa có variation tương
              ứng với dung lượng và số
              ngày đã chọn. Vui lòng thử
              một tổ hợp khác.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500">
              Chọn đầy đủ gói data và
              thời hạn
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-300">
              —
            </p>
          </>
        )}
      </div>

      <AddToCartButton
        productId={product.id}
        variationId={
          selectedVariation?.id
        }
        variation={
          variationPayload
        }
        disabled={
          selectedVariation === null
        }
      />

      {!selectionComplete ? (
        <p className="mt-3 text-center text-sm text-slate-500">
          Vui lòng chọn đầy đủ thuộc
          tính trước khi thêm vào giỏ
          hàng.
        </p>
      ) : null}

      {combinationUnavailable ? (
        <p
          role="alert"
          className="mt-3 text-center text-sm font-medium text-red-600"
        >
          Tổ hợp sản phẩm này hiện chưa
          tồn tại. Hãy thay đổi dung
          lượng hoặc số ngày.
        </p>
      ) : null}

      {variations.length === 0 ? (
        <p
          role="alert"
          className="mt-3 text-center text-sm font-medium text-red-600"
        >
          Sản phẩm chưa có variation khả
          dụng hoặc các variation chưa
          được thiết lập giá và tồn kho.
        </p>
      ) : null}
    </div>
  );
}
