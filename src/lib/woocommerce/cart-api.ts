import type { WooCommerceCart } from "./cart-types";

const wooCommerceUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;

if (!wooCommerceUrl) {
  throw new Error("Missing NEXT_PUBLIC_WOOCOMMERCE_URL environment variable.");
}

const cartApiBaseUrl = `${wooCommerceUrl.replace(
  /\/$/,
  "",
)}/wp-json/wc/store/v1`;

interface CartApiResult<T> {
  data: T;
  cartToken: string | null;
}

interface CartApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  cartToken?: string | null;
  body?: unknown;
}

export async function wooCartApiFetch<T>(
  endpoint: string,
  options: CartApiRequestOptions = {},
): Promise<CartApiResult<T>> {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  if (options.cartToken) {
    headers.set("Cart-Token", options.cartToken);
  }

  const response = await fetch(`${cartApiBaseUrl}${normalizedEndpoint}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const responseText = await response.text();

  let responseData: unknown = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  if (!response.ok) {
    const message =
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData
        ? String(responseData.message)
        : `WooCommerce Cart API error ${response.status}`;

    throw new Error(message);
  }

  return {
    data: responseData as T,
    cartToken: response.headers.get("cart-token"),
  };
}

export async function getWooCart(
  cartToken?: string | null,
): Promise<CartApiResult<WooCommerceCart>> {
  return wooCartApiFetch<WooCommerceCart>("/cart", {
    cartToken,
  });
}

export async function addWooCartItem(
  productId: number,
  quantity: number,
  cartToken: string,
): Promise<CartApiResult<WooCommerceCart>> {
  const params = new URLSearchParams({
    id: String(productId),
    quantity: String(quantity),
  });

  return wooCartApiFetch<WooCommerceCart>(
    `/cart/add-item?${params.toString()}`,
    {
      method: "POST",
      cartToken,
    },
  );
}

export async function updateWooCartItem(
  itemKey: string,
  quantity: number,
  cartToken: string,
): Promise<CartApiResult<WooCommerceCart>> {
  const params = new URLSearchParams({
    key: itemKey,
    quantity: String(quantity),
  });

  return wooCartApiFetch<WooCommerceCart>(
    `/cart/update-item?${params.toString()}`,
    {
      method: "POST",
      cartToken,
    },
  );
}

export async function removeWooCartItem(
  itemKey: string,
  cartToken: string,
): Promise<CartApiResult<WooCommerceCart>> {
  const params = new URLSearchParams({
    key: itemKey,
  });

  return wooCartApiFetch<WooCommerceCart>(
    `/cart/remove-item?${params.toString()}`,
    {
      method: "POST",
      cartToken,
    },
  );
}

export async function applyWooCartCoupon(
  code: string,
  cartToken: string,
): Promise<CartApiResult<WooCommerceCart>> {
  const params = new URLSearchParams({
    code,
  });

  return wooCartApiFetch<WooCommerceCart>(
    `/cart/apply-coupon?${params.toString()}`,
    {
      method: "POST",
      cartToken,
    },
  );
}

export async function removeWooCartCoupon(
  code: string,
  cartToken: string,
): Promise<CartApiResult<WooCommerceCart>> {
  const params = new URLSearchParams({
    code,
  });

  return wooCartApiFetch<WooCommerceCart>(
    `/cart/remove-coupon?${params.toString()}`,
    {
      method: "POST",
      cartToken,
    },
  );
}
