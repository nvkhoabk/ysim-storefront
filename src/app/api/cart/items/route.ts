import { NextResponse } from "next/server";
import { z } from "zod";

import { getCartTokenCookie, setCartTokenCookie } from "@/lib/cart-cookie";
import {
  addWooCartItem,
  getWooCart,
  removeWooCartItem,
  updateWooCartItem,
} from "@/lib/woocommerce/cart-api";

export const dynamic = "force-dynamic";

const variationAttributeSchema = z.object({
  attribute: z.string().min(1),
  value: z.string().min(1),
});

const addCartItemSchema = z.object({
  productId: z.number().int().positive(),
  variationId: z.number().int().positive().optional(),
  variation: z.array(variationAttributeSchema).default([]),
  quantity: z.number().int().min(1).max(100),
});

const updateCartItemSchema = z.object({
  itemKey: z.string().min(1),
  quantity: z.number().int().min(1).max(100),
});

const removeCartItemSchema = z.object({ itemKey: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const parsedBody = addCartItemSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        {
          message: "Dữ liệu thêm vào giỏ hàng không hợp lệ.",
          issues: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    let cartToken = await getCartTokenCookie();
    if (!cartToken) {
      const cartResult = await getWooCart();
      cartToken = cartResult.cartToken;
      if (!cartToken) {
        throw new Error("WooCommerce không trả về Cart-Token.");
      }
      await setCartTokenCookie(cartToken);
    }

    const itemId = parsedBody.data.variationId ?? parsedBody.data.productId;
    const result = await addWooCartItem(
      itemId,
      parsedBody.data.quantity,
      cartToken,
      parsedBody.data.variation,
    );

    if (result.cartToken) {
      await setCartTokenCookie(result.cartToken);
    }

    return NextResponse.json(result.data, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Cannot add WooCommerce cart item:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể thêm sản phẩm vào giỏ hàng.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const parsed = updateCartItemSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dữ liệu cập nhật giỏ hàng không hợp lệ." },
        { status: 400 },
      );
    }
    const cartToken = await getCartTokenCookie();
    if (!cartToken) {
      return NextResponse.json({ message: "Không tìm thấy phiên giỏ hàng." }, { status: 400 });
    }
    const result = await updateWooCartItem(
      parsed.data.itemKey,
      parsed.data.quantity,
      cartToken,
    );
    if (result.cartToken) {
      await setCartTokenCookie(result.cartToken);
    }
    return NextResponse.json(result.data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Cannot update cart item:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Không thể cập nhật sản phẩm." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const parsed = removeCartItemSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dữ liệu xóa sản phẩm không hợp lệ." },
        { status: 400 },
      );
    }
    const cartToken = await getCartTokenCookie();
    if (!cartToken) {
      return NextResponse.json({ message: "Không tìm thấy phiên giỏ hàng." }, { status: 400 });
    }
    const result = await removeWooCartItem(parsed.data.itemKey, cartToken);
    if (result.cartToken) {
      await setCartTokenCookie(result.cartToken);
    }
    return NextResponse.json(result.data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Cannot remove cart item:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Không thể xóa sản phẩm." },
      { status: 500 },
    );
  }
}
