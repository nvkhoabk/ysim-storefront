import type {
  CheckoutAddress,
  WooCommerceCheckout,
} from "@/features/checkout/checkout.types";

const wooCommerceUrl =
  process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;

if (!wooCommerceUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_WOOCOMMERCE_URL environment variable.",
  );
}

const checkoutApiBaseUrl = `${wooCommerceUrl.replace(
  /\/$/,
  "",
)}/wp-json/wc/store/v1`;

interface CheckoutApiResult<T> {
  data: T;
  cartToken: string | null;
}

interface CheckoutApiOptions {
  method?: "GET" | "POST" | "PUT";
  cartToken: string;
  body?: unknown;
}

async function wooCheckoutApiFetch<T>(
  endpoint: string,
  options: CheckoutApiOptions,
): Promise<CheckoutApiResult<T>> {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const response = await fetch(
    `${checkoutApiBaseUrl}${normalizedEndpoint}`,
    {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Cart-Token": options.cartToken,
      },
      body:
        options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
      cache: "no-store",
    },
  );

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
        : `WooCommerce Checkout API error ${response.status}`;

    throw new Error(message);
  }

  return {
    data: responseData as T,
    cartToken: response.headers.get("cart-token"),
  };
}

export async function getWooCheckout(
  cartToken: string,
): Promise<CheckoutApiResult<WooCommerceCheckout>> {
  return wooCheckoutApiFetch<WooCommerceCheckout>(
    "/checkout",
    {
      cartToken,
    },
  );
}

interface ProcessCheckoutInput {
  billingAddress: CheckoutAddress;
  paymentMethod: string;
  customerNote?: string;

  additionalFields?: Record<string, unknown>;

  paymentData?: Array<{
    key: string;
    value: string;
  }>;
}

export async function processWooCheckout(
  input: ProcessCheckoutInput,
  cartToken: string,
): Promise<CheckoutApiResult<WooCommerceCheckout>> {
  return wooCheckoutApiFetch<WooCommerceCheckout>(
    "/checkout",
    {
      method: "POST",
      cartToken,
      body: {
        billing_address: input.billingAddress,

        /*
         * Với sản phẩm virtual, WooCommerce thường không cần
         * shipping_address trong payload tối giản.
         */
        payment_method: input.paymentMethod,

        payment_data: input.paymentData ?? [],

        customer_note: input.customerNote ?? "",

        extensions: {},

        additional_fields:
          input.additionalFields ?? {},
      },
    },
  );
}