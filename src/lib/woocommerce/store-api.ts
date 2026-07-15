const wooCommerceUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;

if (!wooCommerceUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_WOOCOMMERCE_URL environment variable.",
  );
}

const storeApiBaseUrl = `${wooCommerceUrl.replace(
  /\/$/,
  "",
)}/wp-json/wc/store/v1`;

type StoreApiFetchOptions = RequestInit & {
  revalidate?: number;
};

export async function storeApiFetch<T>(
  endpoint: string,
  options: StoreApiFetchOptions = {},
): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const { revalidate = 300, ...fetchOptions } = options;

  const response = await fetch(`${storeApiBaseUrl}${normalizedEndpoint}`, {
    ...fetchOptions,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    next: {
      revalidate,
    },
  });

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(
      `WooCommerce Store API error ${response.status}: ${responseText}`,
    );
  }

  return response.json() as Promise<T>;
}