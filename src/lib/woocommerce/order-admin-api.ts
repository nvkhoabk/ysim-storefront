export interface WooCommerceAdminOrderBilling {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface WooCommerceAdminOrderMetaData {
  id?: number;
  key: string;
  value: unknown;
  display_key?: string;
  display_value?: unknown;
}

export interface WooCommerceAdminOrderImage {
  id?: number;
  src?: string;
}

export interface WooCommerceAdminOrderLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  subtotal: string;
  subtotal_tax?: string;
  total: string;
  total_tax?: string;
  price?: number;
  sku?: string;
  image?:
    WooCommerceAdminOrderImage;
  meta_data?:
    WooCommerceAdminOrderMetaData[];
}

export interface WooCommerceAdminOrderCouponLine {
  id: number;
  code: string;
  discount: string;
  discount_tax?: string;
}

export interface WooCommerceAdminOrder {
  id: number;
  number: string;
  order_key: string;
  status: string;
  currency: string;
  total: string;
  discount_total?: string;
  shipping_total?: string;
  transaction_id?: string;
  payment_method?: string;
  payment_method_title?: string;
  customer_note?: string;
  date_created?: string;
  date_created_gmt?: string;
  date_paid?: string;
  date_paid_gmt?: string;
  billing:
    WooCommerceAdminOrderBilling;
  line_items?:
    WooCommerceAdminOrderLineItem[];
  coupon_lines?:
    WooCommerceAdminOrderCouponLine[];
  meta_data?:
    WooCommerceAdminOrderMetaData[];
}

function requiredEnvironment(
  name: string,
): string {
  const value =
    process.env[
      name
    ]
      ?.trim();

  if (!value) {
    throw new Error(
      `Missing ${name} environment variable.`,
    );
  }

  return value;
}

function adminApiBaseUrl():
  string {
  return `${requiredEnvironment(
    "NEXT_PUBLIC_WOOCOMMERCE_URL",
  ).replace(
    /\/$/,
    "",
  )}/wp-json/wc/v3`;
}

function authorizationHeader():
  string {
  const key =
    requiredEnvironment(
      "WOOCOMMERCE_CONSUMER_KEY",
    );

  const secret =
    requiredEnvironment(
      "WOOCOMMERCE_CONSUMER_SECRET",
    );

  return `Basic ${Buffer.from(
    `${key}:${secret}`,
  ).toString(
    "base64",
  )}`;
}

export async function getWooCommerceAdminOrder(
  orderId: number,
): Promise<
  WooCommerceAdminOrder
> {
  const response =
    await fetch(
      `${adminApiBaseUrl()}/orders/${orderId}`,
      {
        method:
          "GET",
        headers: {
          Accept:
            "application/json",
          Authorization:
            authorizationHeader(),
        },
        cache:
          "no-store",
      },
    );

  const text =
    await response
      .text();

  let body:
    unknown = null;

  if (text) {
    try {
      body =
        JSON.parse(
          text,
        );
    } catch {
      body =
        text;
    }
  }

  if (!response.ok) {
    const message =
      body &&
      typeof body ===
        "object" &&
      "message" in
        body
        ? String(
            body.message,
          )
        : `WooCommerce Order API error ${response.status}`;

    throw new Error(
      message,
    );
  }

  return body as
    WooCommerceAdminOrder;
}
