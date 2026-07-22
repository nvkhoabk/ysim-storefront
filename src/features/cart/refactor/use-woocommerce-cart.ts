"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  WooCommerceCart,
} from "@/lib/woocommerce/cart-types";

import type {
  AddWooCommerceCartItemInput,
} from "@/types/view-models/cart-route-candidate";

import {
  addWooCommerceCartItem,
  applyWooCommerceCartCoupon,
  loadWooCommerceCart,
  removeWooCommerceCartCoupon,
  removeWooCommerceCartItem,
  updateWooCommerceCartItem,
} from "./cart-api-client";

export type CartPendingAction =
  | "load"
  | "add"
  | "coupon"
  | string;

function dispatchCartUpdated(
  cart:
    WooCommerceCart,
) {
  window.dispatchEvent(
    new CustomEvent(
      "ysim-cart-updated",
      {
        detail: {
          itemsCount:
            cart.items_count,
          cart,
        },
      },
    ),
  );
}

export function useWooCommerceCart({
  autoLoad = true,
}: {
  autoLoad?: boolean;
} = {}) {
  const [
    cart,
    setCart,
  ] =
    useState<
      WooCommerceCart | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    pending,
    setPending,
  ] =
    useState<
      CartPendingAction | null
    >(
      autoLoad
        ? "load"
        : null,
    );

  const applyCart =
    useCallback(
      (
        nextCart:
          WooCommerceCart,
      ) => {
        setCart(
          nextCart,
        );
        setError(
          null,
        );
        dispatchCartUpdated(
          nextCart,
        );
      },
      [],
    );

  const reload =
    useCallback(
      async () => {
        setPending(
          "load",
        );
        setError(
          null,
        );

        try {
          applyCart(
            await loadWooCommerceCart(),
          );
        } catch (
          caught
        ) {
          setError(
            caught instanceof
              Error
              ? caught.message
              : "Không thể tải giỏ hàng.",
          );
        } finally {
          setPending(
            null,
          );
        }
      },
      [
        applyCart,
      ],
    );

  useEffect(
    () => {
      if (
        autoLoad
      ) {
        void reload();
      }
    },
    [
      autoLoad,
      reload,
    ],
  );

  useEffect(
    () => {
      function handleUpdated(
        event: Event,
      ) {
        const detail =
          (
            event as
              CustomEvent<{
                cart?:
                  WooCommerceCart;
              }>
          ).detail;

        if (
          detail?.cart
        ) {
          setCart(
            detail.cart,
          );
        }
      }

      window.addEventListener(
        "ysim-cart-updated",
        handleUpdated,
      );

      return () => {
        window.removeEventListener(
          "ysim-cart-updated",
          handleUpdated,
        );
      };
    },
    [],
  );

  const add =
    useCallback(
      async (
        input:
          AddWooCommerceCartItemInput,
      ) => {
        setPending(
          "add",
        );
        setError(
          null,
        );

        try {
          const nextCart =
            await addWooCommerceCartItem(
              input,
            );

          applyCart(
            nextCart,
          );

          return nextCart;
        } catch (
          caught
        ) {
          const message =
            caught instanceof
              Error
              ? caught.message
              : "Không thể thêm sản phẩm vào giỏ.";

          setError(
            message,
          );

          throw caught;
        } finally {
          setPending(
            null,
          );
        }
      },
      [
        applyCart,
      ],
    );

  const updateQuantity =
    useCallback(
      async (
        itemKey: string,
        quantity: number,
      ) => {
        setPending(
          itemKey,
        );
        setError(
          null,
        );

        try {
          const nextCart =
            await updateWooCommerceCartItem(
              itemKey,
              quantity,
            );

          applyCart(
            nextCart,
          );

          return nextCart;
        } catch (
          caught
        ) {
          setError(
            caught instanceof
              Error
              ? caught.message
              : "Không thể cập nhật số lượng.",
          );
          throw caught;
        } finally {
          setPending(
            null,
          );
        }
      },
      [
        applyCart,
      ],
    );

  const remove =
    useCallback(
      async (
        itemKey: string,
      ) => {
        setPending(
          itemKey,
        );
        setError(
          null,
        );

        try {
          const nextCart =
            await removeWooCommerceCartItem(
              itemKey,
            );

          applyCart(
            nextCart,
          );

          return nextCart;
        } catch (
          caught
        ) {
          setError(
            caught instanceof
              Error
              ? caught.message
              : "Không thể xóa sản phẩm.",
          );
          throw caught;
        } finally {
          setPending(
            null,
          );
        }
      },
      [
        applyCart,
      ],
    );

  const applyCoupon =
    useCallback(
      async (
        code: string,
      ) => {
        setPending(
          "coupon",
        );
        setError(
          null,
        );

        try {
          const nextCart =
            await applyWooCommerceCartCoupon(
              code,
            );

          applyCart(
            nextCart,
          );

          return nextCart;
        } catch (
          caught
        ) {
          setError(
            caught instanceof
              Error
              ? caught.message
              : "Không thể áp dụng mã giảm giá.",
          );
          throw caught;
        } finally {
          setPending(
            null,
          );
        }
      },
      [
        applyCart,
      ],
    );

  const removeCoupon =
    useCallback(
      async (
        code: string,
      ) => {
        setPending(
          "coupon",
        );
        setError(
          null,
        );

        try {
          const nextCart =
            await removeWooCommerceCartCoupon(
              code,
            );

          applyCart(
            nextCart,
          );

          return nextCart;
        } catch (
          caught
        ) {
          setError(
            caught instanceof
              Error
              ? caught.message
              : "Không thể gỡ mã giảm giá.",
          );
          throw caught;
        } finally {
          setPending(
            null,
          );
        }
      },
      [
        applyCart,
      ],
    );

  return {
    cart,
    error,
    pending,
    isLoading:
      pending ===
        "load" &&
      !cart,
    reload,
    add,
    updateQuantity,
    remove,
    applyCoupon,
    removeCoupon,
  };
}
