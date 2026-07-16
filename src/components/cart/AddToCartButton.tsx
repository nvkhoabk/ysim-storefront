"use client";

import { useState } from "react";
import { Check, LoaderCircle, ShoppingCart } from "lucide-react";

import type { WooCommerceCart } from "@/lib/woocommerce/cart-types";

interface AddToCartButtonProps {
  productId: number;
  disabled?: boolean;
}

export function AddToCartButton({
  productId,
  disabled = false,
}: AddToCartButtonProps) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAddToCart() {
    if (disabled || status === "loading") {
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "Không thể thêm sản phẩm vào giỏ hàng.",
        );
      }

      const cart = responseData as WooCommerceCart;

      window.dispatchEvent(
        new CustomEvent("ysim-cart-updated", {
          detail: {
            itemsCount: cart.items_count,
          },
        }),
      );

      setStatus("success");

      window.setTimeout(() => {
        setStatus("idle");
      }, 2000);
    } catch (error) {
      setStatus("error");

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể thêm sản phẩm vào giỏ hàng.",
      );
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled || status === "loading" || status === "success"}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-65"
      >
        {status === "loading" ? (
          <>
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Đang thêm...
          </>
        ) : status === "success" ? (
          <>
            <Check className="h-5 w-5" />
            Đã thêm vào giỏ hàng
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            Thêm vào giỏ hàng
          </>
        )}
      </button>

      {errorMessage ? (
        <p className="mt-3 text-center text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}
