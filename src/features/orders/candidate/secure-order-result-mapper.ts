import {
  timingSafeEqual,
} from "node:crypto";

import type {
  PaymentProviderId,
} from "@/features/payments/payment.types";

import {
  getPaymentProviderLabel,
  mapPaymentProviderToCheckoutMethod,
} from "@/features/payments/candidate/payment-provider-presentation";

import {
  getWooCommerceAdminOrder,
} from "@/lib/woocommerce/order-admin-api";

import type {
  WooCommerceAdminOrder,
  WooCommerceAdminOrderLineItem,
  WooCommerceAdminOrderMetaData,
} from "@/lib/woocommerce/order-admin-api";

import type {
  CartLineItemViewModel,
  CartTotalsViewModel,
} from "@/types/view-models/cart-refactor";

import type {
  OrderResultPageViewModel,
  PaymentResultStatus,
  PaymentTimelineItemViewModel,
} from "@/types/view-models/payment-result";

import type {
  SecureOrderLookupResponse,
} from "@/types/view-models/order-route-candidate";

const fallbackImage =
  "/assets/products/esim-product-placeholder.webp";

export class SecureOrderLookupError
  extends Error {
  constructor() {
    super(
      "Cannot verify order access.",
    );

    this.name =
      "SecureOrderLookupError";
  }
}

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

function safeEqual(
  left: string,
  right: string,
): boolean {
  const leftBuffer =
    Buffer.from(
      left,
      "utf8",
    );

  const rightBuffer =
    Buffer.from(
      right,
      "utf8",
    );

  if (
    leftBuffer.length !==
    rightBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    leftBuffer,
    rightBuffer,
  );
}

function numberValue(
  value:
    | string
    | number
    | undefined,
): number {
  const parsed =
    Number(
      value ||
      0,
    );

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
}

function textValue(
  value: unknown,
): string {
  if (
    typeof value ===
    "string"
  ) {
    return value.trim();
  }

  if (
    typeof value ===
      "number" ||
    typeof value ===
      "boolean"
  ) {
    return String(
      value,
    );
  }

  if (
    Array.isArray(
      value,
    )
  ) {
    return value
      .map(
        textValue,
      )
      .filter(Boolean)
      .join(
        " / ",
      );
  }

  return "";
}

function normalizedKey(
  value: string,
): string {
  return value
    .normalize(
      "NFD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[_\s]+/g,
      "-",
    )
    .replace(
      /-+/g,
      "-",
    )
    .trim();
}

function metadataValue(
  metadata:
    readonly WooCommerceAdminOrderMetaData[],
  signals:
    readonly string[],
): string | undefined {
  const normalizedSignals =
    signals.map(
      normalizedKey,
    );

  const item =
    metadata.find(
      (entry) => {
        const key =
          normalizedKey(
            [
              entry.key,
              entry.display_key,
            ]
              .filter(Boolean)
              .join(
                " ",
              ),
          );

        return normalizedSignals.some(
          (signal) =>
            key.includes(
              signal,
            ),
        );
      },
    );

  if (!item) {
    return undefined;
  }

  return (
    textValue(
      item.display_value,
    ) ||
    textValue(
      item.value,
    ) ||
    undefined
  );
}

function lineViewModel(
  line:
    WooCommerceAdminOrderLineItem,
): CartLineItemViewModel {
  const subtotal =
    numberValue(
      line.subtotal,
    );

  const total =
    numberValue(
      line.total,
    );

  const quantity =
    Math.max(
      1,
      line.quantity,
    );

  const metadata =
    line.meta_data ||
    [];

  const dataLabel =
    metadataValue(
      metadata,
      [
        "data",
        "dung-luong",
        "allowance",
        "capacity",
      ],
    ) ||
    "Theo gói đã chọn";

  const durationLabel =
    metadataValue(
      metadata,
      [
        "duration",
        "validity",
        "so-ngay",
        "days",
        "day",
      ],
    ) ||
    "Theo gói đã chọn";

  const destinationName =
    metadataValue(
      metadata,
      [
        "destination",
        "country",
        "quoc-gia",
        "diem-den",
      ],
    ) ||
    "eSIM du lịch";

  const unitPrice =
    total /
    quantity;

  const regularUnitPrice =
    subtotal >
    0
      ? subtotal /
        quantity
      : unitPrice;

  return {
    lineId:
      String(
        line.id,
      ),
    productId:
      line.product_id,
    variationId:
      line.variation_id ||
      line.product_id,
    href:
      "#",
    name:
      line.name,
    destinationName,
    imageUrl:
      normalized(
        line.image
          ?.src,
      ) ||
      fallbackImage,
    imageAlt:
      line.name,
    sku:
      line.sku,
    dataLabel,
    durationLabel,
    quantity,
    unitPrice,
    regularUnitPrice,
    lineSubtotal:
      subtotal,
    lineDiscount:
      Math.max(
        0,
        subtotal -
        total,
      ),
    lineTotal:
      total,
    purchasable:
      true,
    inStock:
      true,
  };
}

function orderTotals(
  order:
    WooCommerceAdminOrder,
  lines:
    readonly CartLineItemViewModel[],
): CartTotalsViewModel {
  const subtotal =
    lines.reduce(
      (
        sum,
        line,
      ) =>
        sum +
        line.lineSubtotal,
      0,
    );

  const productDiscount =
    lines.reduce(
      (
        sum,
        line,
      ) =>
        sum +
        line.lineDiscount,
      0,
    );

  const couponDiscount =
    (
      order.coupon_lines ||
      []
    ).reduce(
      (
        sum,
        coupon,
      ) =>
        sum +
        numberValue(
          coupon.discount,
        ),
      0,
    );

  return {
    itemCount:
      lines.reduce(
        (
          sum,
          line,
        ) =>
          sum +
          line.quantity,
        0,
      ),
    subtotal,
    productDiscount,
    couponDiscount,
    total:
      numberValue(
        order.total,
      ),
  };
}

function status(
  value: string,
): PaymentResultStatus {
  const normalizedStatus =
    normalized(
      value,
    )
      .toLowerCase();

  if (
    normalizedStatus ===
      "processing" ||
    normalizedStatus ===
      "completed"
  ) {
    return "success";
  }

  if (
    normalizedStatus ===
      "failed" ||
    normalizedStatus ===
      "cancelled" ||
    normalizedStatus ===
      "refunded" ||
    normalizedStatus ===
      "trash"
  ) {
    return "failed";
  }

  return "pending";
}

function statusLabel(
  value: string,
): string {
  switch (
    normalized(
      value,
    )
      .toLowerCase()
  ) {
    case "pending":
      return "Chờ thanh toán";

    case "on-hold":
      return "Đang chờ xác nhận";

    case "processing":
      return "Đã thanh toán";

    case "completed":
      return "Hoàn tất";

    case "failed":
      return "Thanh toán thất bại";

    case "cancelled":
      return "Đã hủy";

    case "refunded":
      return "Đã hoàn tiền";

    case "checkout-draft":
      return "Đang tạo đơn";

    default:
      return "Đang xử lý";
  }
}

function noteLine(
  note:
    | string
    | undefined,
  prefix: string,
): string | undefined {
  const normalizedPrefix =
    prefix
      .trim()
      .toLowerCase();

  const line =
    (
      note ||
      ""
    )
      .split(
        /\r?\n/,
      )
      .map(
        (value) =>
          value.trim(),
      )
      .find(
        (value) =>
          value
            .toLowerCase()
            .startsWith(
              normalizedPrefix,
            ),
      );

  if (!line) {
    return undefined;
  }

  return line
    .slice(
      line.indexOf(
        ":",
      ) +
        1,
    )
    .trim() ||
    undefined;
}

function orderMetaValue(
  order:
    WooCommerceAdminOrder,
  signals:
    readonly string[],
): string | undefined {
  return metadataValue(
    order.meta_data ||
    [],
    signals,
  );
}

function providerRaw(
  order:
    WooCommerceAdminOrder,
): string {
  return (
    orderMetaValue(
      order,
      [
        "ysim-payment-provider",
        "payment-provider",
      ],
    ) ||
    noteLine(
      order.customer_note,
      "Phương thức thanh toán YSim:",
    ) ||
    order.payment_method ||
    "cash_agent"
  );
}

function providerType(
  value: string,
): PaymentProviderId {
  return value as
    PaymentProviderId;
}

function timeline(
  order:
    WooCommerceAdminOrder,
): readonly PaymentTimelineItemViewModel[] {
  const currentStatus =
    normalized(
      order.status,
    )
      .toLowerCase();

  const paid =
    currentStatus ===
      "processing" ||
    currentStatus ===
      "completed";

  const failed =
    currentStatus ===
      "failed" ||
    currentStatus ===
      "cancelled" ||
    currentStatus ===
      "refunded";

  const completed =
    currentStatus ===
    "completed";

  return [
    {
      id:
        "order-created",
      title:
        "Đơn hàng đã được tạo",
      description:
        `WooCommerce Order #${order.number || order.id}`,
      timeLabel:
        order.date_created
          ? new Date(
              order.date_created,
            ).toLocaleString(
              "vi-VN",
            )
          : undefined,
      state:
        "complete",
    },
    {
      id:
        "payment",
      title:
        paid
          ? "Thanh toán đã được ghi nhận"
          : failed
            ? "Thanh toán không hoàn tất"
            : "Đang chờ thanh toán",
      description:
        order.transaction_id
          ? `Mã giao dịch: ${order.transaction_id}`
          : undefined,
      state:
        paid
          ? "complete"
          : failed
            ? "error"
            : "current",
    },
    {
      id:
        "fulfillment",
      title:
        completed
          ? "eSIM đã được xử lý"
          : "Chuẩn bị và gửi eSIM",
      description:
        completed
          ? "WooCommerce Order đã hoàn tất."
          : "Package 31 chưa thực hiện Gigago fulfillment.",
      state:
        completed
          ? "complete"
          : paid
            ? "current"
            : "upcoming",
    },
  ];
}

export async function lookupSecureOrderResult({
  orderId,
  orderKey,
}: {
  orderId: number;
  orderKey: string;
}): Promise<
  SecureOrderLookupResponse
> {
  let order:
    WooCommerceAdminOrder;

  try {
    order =
      await getWooCommerceAdminOrder(
        orderId,
      );
  } catch {
    throw new SecureOrderLookupError();
  }

  if (
    !safeEqual(
      normalized(
        order.order_key,
      ),
      normalized(
        orderKey,
      ),
    )
  ) {
    throw new SecureOrderLookupError();
  }

  const lines =
    (
      order.line_items ||
      []
    ).map(
      lineViewModel,
    );

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
    "Khách hàng YSim";

  const customerEmail =
    normalized(
      order.billing
        ?.email,
    ) ||
    "Không có";

  const recipientName =
    noteLine(
      order.customer_note,
      "Người nhận:",
    ) ||
    customerName;

  const recipientEmail =
    noteLine(
      order.customer_note,
      "Email người nhận:",
    ) ||
    customerEmail;

  const rawProvider =
    providerRaw(
      order,
    );

  const provider =
    providerType(
      rawProvider,
    );

  return {
    order: {
      orderCode:
        order.number ||
        String(
          order.id,
        ),
      createdAtLabel:
        order.date_created
          ? new Date(
              order.date_created,
            ).toLocaleString(
              "vi-VN",
            )
          : order.date_created_gmt
            ? new Date(
                `${order.date_created_gmt}Z`,
              ).toLocaleString(
                "vi-VN",
              )
            : "Không rõ",
      status:
        status(
          order.status,
        ),
      statusLabel:
        statusLabel(
          order.status,
        ),
      lines,
      totals:
        orderTotals(
          order,
          lines,
        ),
      customer: {
        fullName:
          customerName,
        email:
          customerEmail,
        phone:
          normalized(
            order.billing
              ?.phone,
          ) ||
          undefined,
      },
      recipient: {
        fullName:
          recipientName,
        email:
          recipientEmail,
      },
      payment: {
        methodId:
          mapPaymentProviderToCheckoutMethod(
            provider,
          ),
        methodLabel:
          getPaymentProviderLabel(
            provider,
          ),
        status:
          status(
            order.status,
          ),
        statusLabel:
          statusLabel(
            order.status,
          ),
        providerReference:
          normalized(
            order.transaction_id,
          ) ||
          undefined,
      },
      timeline:
        timeline(
          order,
        ),
      supportText:
        "Cần hỗ trợ về đơn hàng? Hãy cung cấp mã đơn cho đội ngũ YSim; không gửi order key cho người khác.",
    },
    proof: {
      orderId:
        order.id,
      orderNumber:
        order.number ||
        String(
          order.id,
        ),
      verifiedAt:
        new Date()
          .toISOString(),
    },
  };
}
