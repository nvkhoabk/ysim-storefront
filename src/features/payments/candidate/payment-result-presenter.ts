import type {
  PaymentProviderId,
  PaymentSession,
  PaymentStatus,
} from "@/features/payments/payment.types";

import type {
  CheckoutOrderHandoff,
} from "@/types/view-models/checkout-route-candidate";

import {
  getPaymentProviderLabel,
  mapPaymentProviderToCheckoutMethod,
} from "./payment-provider-presentation";

import type {
  PaymentResultPageViewModel,
  PaymentResultStatus,
  PaymentTimelineItemViewModel,
} from "@/types/view-models/payment-result";

function resultStatus(
  status:
    PaymentStatus,
): PaymentResultStatus {
  switch (
    status
  ) {
    case "paid":
      return "success";

    case "failed":
    case "expired":
    case "cancelled":
      return "failed";

    case "created":
      return "processing";

    case "waiting":
    case "redirect_required":
    case "manual_review":
    default:
      return "pending";
  }
}

function providerLabel(
  provider:
    PaymentProviderId,
): string {
  return getPaymentProviderLabel(
    provider,
  );
}

function statusCopy(
  session:
    PaymentSession,
): {
  label: string;
  title: string;
  description: string;
} {
  const status =
    resultStatus(
      session.status,
    );

  if (
    status ===
    "success"
  ) {
    return {
      label:
        "Thanh toán thành công",
      title:
        "Đã nhận thanh toán",
      description:
        "Đơn hàng sẽ được chuyển sang quy trình chuẩn bị và gửi eSIM.",
    };
  }

  if (
    status ===
    "failed"
  ) {
    return {
      label:
        "Thanh toán thất bại",
      title:
        "Không thể hoàn tất thanh toán",
      description:
        session.message ||
        "Vui lòng kiểm tra lại hoặc chọn phương thức thanh toán khác.",
    };
  }

  if (
    status ===
    "processing"
  ) {
    return {
      label:
        "Đang khởi tạo",
      title:
        "Đang chuẩn bị phiên thanh toán",
      description:
        session.message ||
        "Hệ thống đang khởi tạo phiên với nhà cung cấp thanh toán.",
    };
  }

  return {
    label:
      "Đang chờ thanh toán",
    title:
      session.status ===
      "redirect_required"
        ? "Sẵn sàng chuyển tới cổng thanh toán"
        : "Đơn hàng đang chờ thanh toán",
    description:
      session.message ||
      "Hoàn tất bước thanh toán theo hướng dẫn của phương thức đã chọn.",
  };
}

function timeline(
  session:
    PaymentSession,
): readonly PaymentTimelineItemViewModel[] {
  const status =
    resultStatus(
      session.status,
    );

  if (
    status ===
    "failed"
  ) {
    return [
      {
        id:
          "order",
        title:
          "Đơn hàng đã được tạo",
        state:
          "complete",
      },
      {
        id:
          "session",
        title:
          "Khởi tạo thanh toán",
        description:
          session.message,
        state:
          "error",
      },
      {
        id:
          "fulfillment",
        title:
          "Chuẩn bị eSIM",
        state:
          "upcoming",
      },
    ];
  }

  if (
    status ===
    "success"
  ) {
    return [
      {
        id:
          "order",
        title:
          "Đơn hàng đã được tạo",
        state:
          "complete",
      },
      {
        id:
          "payment",
        title:
          "Thanh toán đã được xác nhận",
        state:
          "complete",
      },
      {
        id:
          "fulfillment",
        title:
          "Chuẩn bị và gửi eSIM",
        state:
          "current",
      },
    ];
  }

  return [
    {
      id:
        "order",
      title:
        "Đơn hàng đã được tạo",
      state:
        "complete",
    },
    {
      id:
        "payment",
      title:
        session.status ===
        "redirect_required"
          ? "Hoàn tất tại cổng thanh toán"
          : "Chờ xác nhận thanh toán",
      description:
        session.message,
      state:
        "current",
    },
    {
      id:
        "fulfillment",
      title:
        "Chuẩn bị eSIM",
      state:
        "upcoming",
    },
  ];
}

export function presentPaymentCandidateResult({
  session,
  handoff,
}: {
  session:
    PaymentSession;
  handoff:
    CheckoutOrderHandoff;
}): PaymentResultPageViewModel {
  const copy =
    statusCopy(
      session,
    );

  return {
    result: {
      status:
        resultStatus(
          session.status,
        ),
      statusLabel:
        copy.label,
      orderCode:
        session.orderNumber,
      title:
        copy.title,
      description:
        copy.description,
      paymentMethodId:
        mapPaymentProviderToCheckoutMethod(
          session.provider,
        ),
      paymentMethodLabel:
        providerLabel(
          session.provider,
        ),
      amount:
        session.amount,
      customerEmail:
        handoff.customerEmail,
      recipientEmail:
        handoff.recipientEmail,
      createdAtLabel:
        new Date(
          handoff.createdAt,
        ).toLocaleString(
          "vi-VN",
        ),
      providerReference:
        session.providerTransactionId ||
        session.merchantTransactionId,
      note:
        session.message,
      supportText:
        "Package 30 chưa xử lý callback, cập nhật Order paid hoặc fulfillment.",
      actions: [
        {
          label:
            "Xem giỏ hàng",
          href:
            "/ui-preview/cart-route-candidate",
          variant:
            "secondary",
        },
        {
          label:
            "Về trang chủ",
          href:
            "/",
          variant:
            "primary",
        },
      ],
      timeline:
        timeline(
          session,
        ),
    },
  };
}
