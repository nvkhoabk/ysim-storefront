import { NextResponse } from "next/server";

import { getCartTokenCookie, setCartTokenCookie } from "@/lib/cart-cookie";
import { getWooCart } from "@/lib/woocommerce/cart-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const existingToken = await getCartTokenCookie();

    const result = await getWooCart(existingToken);

    if (result.cartToken) {
      await setCartTokenCookie(result.cartToken);
    }

    return NextResponse.json(result.data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Cannot load WooCommerce cart:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Không thể tải giỏ hàng.",
      },
      {
        status: 500,
      },
    );
  }
}
