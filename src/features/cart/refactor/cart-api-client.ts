import type {
  WooCommerceCart,
} from "@/lib/woocommerce/cart-types";

import type {
  AddWooCommerceCartItemInput,
} from "@/types/view-models/cart-route-candidate";

interface ApiErrorBody {
  message?: string;
}

async function readResponse(
  response: Response,
): Promise<
  WooCommerceCart
> {
  const body =
    await response
      .json()
      .catch(
        () => null,
      );

  if (!response.ok) {
    const message =
      body &&
      typeof body ===
        "object" &&
      "message" in
        body
        ? String(
            (
              body as
                ApiErrorBody
            ).message ||
            "",
          )
        : "";

    throw new Error(
      message ||
      `Cart API error ${response.status}`,
    );
  }

  return body as
    WooCommerceCart;
}

export async function loadWooCommerceCart():
  Promise<
    WooCommerceCart
  > {
  return readResponse(
    await fetch(
      "/api/cart",
      {
        cache:
          "no-store",
      },
    ),
  );
}

export async function addWooCommerceCartItem(
  input:
    AddWooCommerceCartItemInput,
): Promise<
  WooCommerceCart
> {
  return readResponse(
    await fetch(
      "/api/cart/items",
      {
        method:
          "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify(
            input,
          ),
      },
    ),
  );
}

export async function updateWooCommerceCartItem(
  itemKey: string,
  quantity: number,
): Promise<
  WooCommerceCart
> {
  return readResponse(
    await fetch(
      "/api/cart/items",
      {
        method:
          "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
            itemKey,
            quantity,
          }),
      },
    ),
  );
}

export async function removeWooCommerceCartItem(
  itemKey: string,
): Promise<
  WooCommerceCart
> {
  return readResponse(
    await fetch(
      "/api/cart/items",
      {
        method:
          "DELETE",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
            itemKey,
          }),
      },
    ),
  );
}

export async function applyWooCommerceCartCoupon(
  code: string,
): Promise<
  WooCommerceCart
> {
  return readResponse(
    await fetch(
      "/api/cart/coupons",
      {
        method:
          "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
            code,
          }),
      },
    ),
  );
}

export async function removeWooCommerceCartCoupon(
  code: string,
): Promise<
  WooCommerceCart
> {
  return readResponse(
    await fetch(
      "/api/cart/coupons",
      {
        method:
          "DELETE",
        headers: {
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify({
            code,
          }),
      },
    ),
  );
}
