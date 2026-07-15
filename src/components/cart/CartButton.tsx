"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import type { WooCommerceCart } from "@/lib/woocommerce/cart-types";

export function CartButton() {
  const [itemsCount, setItemsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadCart() {
      try {
        const response = await fetch("/api/cart", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const cart =
          (await response.json()) as WooCommerceCart;

        if (isMounted) {
          setItemsCount(cart.items_count);
        }
      } catch (error) {
        console.error("Cannot load cart count:", error);
      }
    }

    function handleCartUpdated(event: Event) {
      const customEvent = event as CustomEvent<{
        itemsCount: number;
      }>;

      setItemsCount(customEvent.detail.itemsCount);
    }

    void loadCart();

    window.addEventListener(
      "ysim-cart-updated",
      handleCartUpdated,
    );

    return () => {
      isMounted = false;

      window.removeEventListener(
        "ysim-cart-updated",
        handleCartUpdated,
      );
    };
  }, []);

  return (
    <Link
      href="/cart"
      aria-label={`Giỏ hàng có ${itemsCount} sản phẩm`}
      className="relative rounded-lg p-2 text-slate-700 transition hover:bg-slate-100"
    >
      <ShoppingCart className="h-5 w-5" />

      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-700 px-1 text-xs font-semibold text-white">
        {itemsCount > 99 ? "99+" : itemsCount}
      </span>
    </Link>
  );
}