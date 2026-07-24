import type {
  WooCommerceAdminOrder,
  WooCommerceAdminOrderMetaData,
} from "./order-admin-api";

export interface WooCommerceAdminOrderUpdate {
  meta_data?: WooCommerceAdminOrderMetaData[];
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }

  return value;
}

function adminApiBaseUrl(): string {
  return `${requiredEnvironment("NEXT_PUBLIC_WOOCOMMERCE_URL").replace(
    /\/$/,
    "",
  )}/wp-json/wc/v3`;
}

function authorizationHeader(): string {
  const key = requiredEnvironment("WOOCOMMERCE_CONSUMER_KEY");
  const secret = requiredEnvironment("WOOCOMMERCE_CONSUMER_SECRET");

  return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function responseMessage(body: unknown, status: number): string {
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }

  return `WooCommerce Order API error ${status}`;
}

export async function updateWooCommerceAdminOrder(
  orderId: number,
  update: WooCommerceAdminOrderUpdate,
): Promise<WooCommerceAdminOrder> {
  const response = await fetch(`${adminApiBaseUrl()}/orders/${orderId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: authorizationHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(update),
    cache: "no-store",
  });

  const body = await parseResponse(response);

  if (!response.ok) {
    throw new Error(responseMessage(body, response.status));
  }

  return body as WooCommerceAdminOrder;
}

export function upsertWooCommerceOrderMeta(
  order: WooCommerceAdminOrder,
  entries: Readonly<Record<string, unknown>>,
): WooCommerceAdminOrderMetaData[] {
  const existing = order.meta_data ?? [];
  const byKey = new Map(existing.map((item) => [item.key, item]));

  return Object.entries(entries).map(([key, value]) => {
    const current = byKey.get(key);

    return {
      ...(current?.id ? { id: current.id } : {}),
      key,
      value,
    };
  });
}

export function readWooCommerceOrderMeta(
  order: WooCommerceAdminOrder,
  key: string,
): unknown {
  return order.meta_data?.find((item) => item.key === key)?.value;
}

export function readWooCommerceOrderMetaString(
  order: WooCommerceAdminOrder,
  key: string,
): string | null {
  const value = readWooCommerceOrderMeta(order, key);

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}
