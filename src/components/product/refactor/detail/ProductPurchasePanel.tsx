"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  ShoppingCart,
} from "lucide-react";

import { Price } from "@/components/ui";
import type {
  ProductDetailVariationViewModel,
  ProductDetailViewModel,
} from "@/types/view-models/product-detail";
import { cn } from "@/lib/ui/cn";

function findVariation(
  variations: readonly ProductDetailVariationViewModel[],
  dataValue: string,
  durationValue: string,
) {
  return variations.find(
    (item) =>
      item.dataValue === dataValue &&
      item.durationValue === durationValue,
  );
}

export function ProductPurchasePanel({
  product,
}: {
  product: ProductDetailViewModel;
}) {
  const initial =
    product.variations.find(
      (item) => item.id === product.initialVariationId,
    ) ?? product.variations[0];

  const [dataValue, setDataValue] = useState(initial?.dataValue ?? "");
  const [durationValue, setDurationValue] =
    useState(initial?.durationValue ?? "");
  const [added, setAdded] = useState(false);

  const selectedVariation = useMemo(
    () => findVariation(product.variations, dataValue, durationValue),
    [product.variations, dataValue, durationValue],
  );

  function selectData(value: string) {
    setAdded(false);
    const exact = findVariation(product.variations, value, durationValue);
    const fallback = product.variations.find(
      (item) => item.dataValue === value,
    );

    setDataValue(value);
    if (!exact && fallback) setDurationValue(fallback.durationValue);
  }

  function selectDuration(value: string) {
    setAdded(false);
    const exact = findVariation(product.variations, dataValue, value);
    const fallback = product.variations.find(
      (item) => item.durationValue === value,
    );

    setDurationValue(value);
    if (!exact && fallback) setDataValue(fallback.dataValue);
  }

  const canPurchase = Boolean(
    selectedVariation?.purchasable && selectedVariation?.inStock,
  );

  const optionClass = (active: boolean) =>
    cn(
      "min-h-11 rounded-[var(--ysim-radius-md)] border px-4 py-2 text-sm font-bold",
      active
        ? "border-[var(--ysim-color-brand-700)] bg-[var(--ysim-color-brand-700)] text-white"
        : "border-[var(--ysim-color-border-strong)] bg-white text-[var(--ysim-color-text)]",
    );

  return (
    <div className="mt-7 rounded-[var(--ysim-radius-xl)] border border-[var(--ysim-color-border)] bg-[var(--ysim-color-surface-subtle)] p-5 sm:p-6">
      <fieldset>
        <legend className="text-sm font-bold">Chọn dung lượng</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.dataOptions.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={option === dataValue}
              onClick={() => selectData(option)}
              className={optionClass(option === dataValue)}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-bold">Chọn số ngày</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.durationOptions.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={option === durationValue}
              onClick={() => selectDuration(option)}
              className={optionClass(option === durationValue)}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-7 border-t border-[var(--ysim-color-border)] pt-6">
        {selectedVariation ? (
          <>
            <Price
              amount={selectedVariation.price}
              originalAmount={selectedVariation.regularPrice}
              discountLabel={selectedVariation.discountLabel}
            />
            <p className="mt-2 text-xs text-[var(--ysim-color-text-soft)]">
              SKU: {selectedVariation.sku ?? "—"}
            </p>
          </>
        ) : (
          <p className="text-sm font-semibold text-red-700">
            Không có gói phù hợp với lựa chọn này.
          </p>
        )}

        <button
          type="button"
          disabled={!canPurchase}
          onClick={() => setAdded(true)}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--ysim-radius-md)] bg-[var(--ysim-color-brand-700)] px-5 py-3 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ShoppingCart className="h-5 w-5" />
          Thêm vào giỏ
        </button>

        {!canPurchase ? (
          <p className="mt-3 flex gap-2 text-sm font-semibold text-red-700">
            <CircleAlert className="h-4 w-4 shrink-0" />
            Gói này hiện chưa sẵn sàng để mua.
          </p>
        ) : null}

        {added && canPurchase ? (
          <p
            aria-live="polite"
            className="mt-3 flex gap-2 text-sm font-semibold text-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Đã mô phỏng thêm gói vào giỏ hàng.
          </p>
        ) : null}
      </div>
    </div>
  );
}
