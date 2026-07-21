"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  cartPreviewCouponRules,
  cartPreviewLines,
  cartPreviewRelatedProducts,
} from "@/config/storefront-cart-preview";

import {
  createCartPageViewModel,
} from "@/features/cart/refactor/cart-presenter";

import type {
  CartLineSource,
} from "@/types/view-models/cart-refactor";

import {
  CartPageComposition,
} from "./CartPageComposition";

export function CartPagePreview() {
  const [
    lines,
    setLines,
  ] =
    useState<
      readonly CartLineSource[]
    >(
      cartPreviewLines,
    );

  const [
    promoValue,
    setPromoValue,
  ] =
    useState("");

  const [
    appliedPromo,
    setAppliedPromo,
  ] =
    useState<
      string | undefined
    >();

  const [
    promoMessage,
    setPromoMessage,
  ] =
    useState<
      string | undefined
    >();

  const cart =
    useMemo(
      () =>
        createCartPageViewModel({
          lines,

          couponCode:
            appliedPromo,

          couponRules:
            cartPreviewCouponRules,

          relatedProducts:
            cartPreviewRelatedProducts,
        }),
      [
        lines,
        appliedPromo,
      ],
    );

  function updateQuantity(
    lineId: string,
    quantity: number,
  ) {
    setLines(
      (current) =>
        current.map(
          (line) =>
            line.lineId ===
            lineId
              ? {
                  ...line,
                  quantity:
                    Math.max(
                      1,
                      Math.min(
                        99,
                        quantity,
                      ),
                    ),
                }
              : line,
        ),
    );
  }

  function removeLine(
    lineId: string,
  ) {
    setLines(
      (current) =>
        current.filter(
          (line) =>
            line.lineId !==
            lineId,
        ),
    );
  }

  function applyPromo() {
    const normalized =
      promoValue
        .trim()
        .toUpperCase();

    const exists =
      cartPreviewCouponRules.some(
        (rule) =>
          rule.code.toUpperCase() ===
          normalized,
      );

    if (!exists) {
      setAppliedPromo(
        undefined,
      );

      setPromoMessage(
        normalized
          ? "Mã ưu đãi không hợp lệ."
          : "Hãy nhập mã ưu đãi.",
      );

      return;
    }

    setAppliedPromo(
      normalized,
    );

    setPromoValue(
      normalized,
    );

    setPromoMessage(
      undefined,
    );
  }

  return (
    <CartPageComposition
      cart={
        cart
      }
      promoValue={
        promoValue
      }
      promoMessage={
        promoMessage
      }
      onPromoChange={(
        value,
      ) => {
        setPromoValue(
          value,
        );

        setPromoMessage(
          undefined,
        );
      }}
      onApplyPromo={
        applyPromo
      }
      onQuantityChange={
        updateQuantity
      }
      onRemove={
        removeLine
      }
    />
  );
}
