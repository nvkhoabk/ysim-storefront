import { NextResponse } from "next/server";
import { z } from "zod";

import { getCartTokenCookie, setCartTokenCookie } from "@/lib/cart-cookie";
import {
  applyWooCartCoupon,
  removeWooCartCoupon,
} from "@/lib/woocommerce/cart-api";

export const dynamic = "force-dynamic";

const couponSchema = z.object({
  code: z.string().trim().min(1).max(100),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = couponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Mã giảm giá không hợp lệ.",
        },
        {
          status: 400,
        },
      );
    }

    const cartToken = await getCartTokenCookie();

    if (!cartToken) {
      return NextResponse.json(
        {
          message: "Không tìm thấy phiên giỏ hàng.",
        },
        {
          status: 400,
        },
      );
    }

    const result = await applyWooCartCoupon(parsed.data.code, cartToken);

    if (result.cartToken) {
      await setCartTokenCookie(result.cartToken);
    }

    return NextResponse.json(result.data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Cannot apply coupon:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể áp dụng mã giảm giá.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const parsed = couponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Mã giảm giá không hợp lệ.",
        },
        {
          status: 400,
        },
      );
    }

    const cartToken = await getCartTokenCookie();

    if (!cartToken) {
      return NextResponse.json(
        {
          message: "Không tìm thấy phiên giỏ hàng.",
        },
        {
          status: 400,
        },
      );
    }

    const result = await removeWooCartCoupon(parsed.data.code, cartToken);

    if (result.cartToken) {
      await setCartTokenCookie(result.cartToken);
    }

    return NextResponse.json(result.data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Cannot remove coupon:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Không thể gỡ mã giảm giá.",
      },
      {
        status: 500,
      },
    );
  }
}
