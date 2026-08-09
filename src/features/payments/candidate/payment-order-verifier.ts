import type {
  CreatePaymentInput,
  PaymentProviderId,
} from "@/features/payments/payment.types";

import {
  getPaymentCandidateEnabledProviders,
  getPaymentCandidatePayableStatuses,
} from "@/config/storefront-payment-route-candidate";

import {
  getWooCommerceAdminOrder,
} from "@/lib/woocommerce/order-admin-api";

import type {
  VerifiedPaymentOrderSummary,
} from "@/types/view-models/payment-route-candidate";

function normalized(
  value:
    | string
    | undefined,
): string {
  return (
    value ||
    ""
  )
    .trim();
}

function maskEmail(
  value: string,
): string {
  const [
    local,
    domain,
  ] =
    value.split(
      "@",
    );

  if (
    !local ||
    !domain
  ) {
    return "***";
  }

  return `${local.slice(
    0,
    2,
  )}***@${domain}`;
}

function clientIp(
  headers: Headers,
): string | undefined {
  return (
    headers
      .get(
        "x-forwarded-for",
      )
      ?.split(
        ",",
      )[0]
      ?.trim() ||
    headers
      .get(
        "x-real-ip",
      )
      ?.trim() ||
    undefined
  );
}

export async function verifyPaymentOrder({
  orderId,
  orderKey,
  provider,
  requestHeaders,
}: {
  orderId: number;
  orderKey: string;
  provider:
    PaymentProviderId;
  requestHeaders:
    Headers;
}): Promise<{
  input:
    CreatePaymentInput;
  order:
    VerifiedPaymentOrderSummary;
}> {
  const enabledProviders =
    getPaymentCandidateEnabledProviders();

  if (
    !enabledProviders.includes(
      provider,
    )
  ) {
    throw new Error(
      `Payment provider ${provider} is not enabled for candidate testing.`,
    );
  }

  const order =
    await getWooCommerceAdminOrder(
      orderId,
    );

  if (
    normalized(
      order.order_key,
    ) !==
    normalized(
      orderKey,
    )
  ) {
    throw new Error(
      "WooCommerce order key does not match.",
    );
  }

  const status =
    normalized(
      order.status,
    )
      .toLowerCase();

  const payable =
    getPaymentCandidatePayableStatuses();

  if (
    !payable.includes(
      status,
    )
  ) {
    throw new Error(
      `WooCommerce order status ${status || "unknown"} is not payable.`,
    );
  }

  const amount =
    Number(
      order.total,
    );

  if (
    !Number.isFinite(
      amount,
    ) ||
    amount <=
      0
  ) {
    throw new Error(
      "WooCommerce order total is not payable.",
    );
  }

  const currency =
    normalized(
      order.currency,
    )
      .toUpperCase();

  if (
    currency.length !==
    3
  ) {
    throw new Error(
      "WooCommerce order currency is invalid.",
    );
  }

  const customerName =
    [
      order.billing
        ?.first_name,
      order.billing
        ?.last_name,
    ]
      .filter(Boolean)
      .join(
        " ",
      )
      .trim() ||
    `YSim Order ${order.number}`;

  const customerEmail =
    normalized(
      order.billing
        ?.email,
    );

  const customerPhone =
    normalized(
      order.billing
        ?.phone,
    );

  if (!customerEmail) {
    throw new Error(
      "WooCommerce order has no billing email.",
    );
  }

  if (!customerPhone) {
    throw new Error(
      "WooCommerce order has no billing phone.",
    );
  }

  return {
    input: {
      orderId:
        order.id,
      orderNumber:
        order.number ||
        String(
          order.id,
        ),
      orderKey:
        order.order_key,
      amount,
      currency,
      customerName,
      customerEmail,
      customerPhone,
      description:
        `Thanh toán đơn hàng YSim #${order.number || order.id}`,
      clientIp:
        clientIp(
          requestHeaders,
        ),
    },
    order: {
      orderId:
        order.id,
      orderNumber:
        order.number ||
        String(
          order.id,
        ),
      status,
      amount,
      currency,
      customerEmailMasked:
        maskEmail(
          customerEmail,
        ),
    },
  };
}
