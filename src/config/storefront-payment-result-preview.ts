import {
  checkoutPreviewPage,
} from "@/config/storefront-checkout-preview";

import type {
  OrderResultPageViewModel,
  PaymentResultPageViewModel,
  PaymentResultStatus,
  PaymentTimelineItemViewModel,
} from "@/types/view-models/payment-result";

export const paymentPreviewOrderCode =
  "YSIM-DEMO-20260721-001";

const orderResultHref =
  `/ui-preview/order-result-refactor/${paymentPreviewOrderCode}`;

function createTimeline(
  status:
    PaymentResultStatus,
): readonly PaymentTimelineItemViewModel[] {
  if (
    status ===
    "success"
  ) {
    return [
      {
        id:
          "created",
        title:
          "Đơn hàng đã được tạo",
        description:
          "YSim đã ghi nhận thông tin đơn hàng.",
        timeLabel:
          "10:30",
        state:
          "complete",
      },
      {
        id:
          "payment",
        title:
          "Thanh toán thành công",
        description:
          "Giao dịch đã được xác nhận.",
        timeLabel:
          "10:31",
        state:
          "complete",
      },
      {
        id:
          "fulfillment",
        title:
          "Đang chuẩn bị eSIM",
        description:
          "Mã QR sẽ được gửi đến email người nhận.",
        state:
          "current",
      },
    ];
  }

  if (
    status ===
    "failed"
  ) {
    return [
      {
        id:
          "created",
        title:
          "Đơn hàng đã được tạo",
        timeLabel:
          "10:30",
        state:
          "complete",
      },
      {
        id:
          "payment",
        title:
          "Thanh toán chưa thành công",
        description:
          "Giao dịch bị từ chối, hủy hoặc hết thời gian.",
        timeLabel:
          "10:31",
        state:
          "error",
      },
      {
        id:
          "retry",
        title:
          "Chờ thanh toán lại",
        description:
          "Bạn có thể quay lại Checkout để thử phương thức khác.",
        state:
          "upcoming",
      },
    ];
  }

  if (
    status ===
    "pending"
  ) {
    return [
      {
        id:
          "created",
        title:
          "Đơn hàng đã được tạo",
        timeLabel:
          "10:30",
        state:
          "complete",
      },
      {
        id:
          "payment",
        title:
          "Chờ xác nhận thanh toán",
        description:
          "Bộ phận vận hành đang kiểm tra giao dịch.",
        state:
          "current",
      },
      {
        id:
          "fulfillment",
        title:
          "Gửi eSIM",
        description:
          "Bước này bắt đầu sau khi thanh toán được xác nhận.",
        state:
          "upcoming",
      },
    ];
  }

  return [
    {
      id:
        "created",
      title:
        "Đơn hàng đã được tạo",
      timeLabel:
        "10:30",
      state:
        "complete",
    },
    {
      id:
        "payment",
      title:
        "Đang xử lý thanh toán",
      description:
        "Hệ thống đang chờ kết quả từ phương thức thanh toán.",
      state:
        "current",
    },
    {
      id:
        "result",
      title:
        "Cập nhật kết quả",
      description:
        "Trang sẽ hiển thị kết quả sau khi giao dịch được xác nhận.",
      state:
        "upcoming",
    },
  ];
}

export function createPaymentResultPreview(
  status:
    PaymentResultStatus,
): PaymentResultPageViewModel {
  const base = {
    orderCode:
      paymentPreviewOrderCode,

    paymentMethodId:
      "gpay" as const,

    paymentMethodLabel:
      "Thanh toán QR GPay",

    amount:
      checkoutPreviewPage
        .totals
        .total,

    customerEmail:
      "khoa@example.com",

    recipientEmail:
      "khoa@example.com",

    createdAtLabel:
      "21/07/2026 · 10:30",

    providerReference:
      status ===
      "processing"
        ? undefined
        : "GPAY-DEMO-908172",

    supportText:
      "Cần hỗ trợ? Hãy cung cấp mã đơn hàng cho bộ phận YSim.",

    timeline:
      createTimeline(
        status,
      ),
  };

  if (
    status ===
    "success"
  ) {
    return {
      result: {
        ...base,
        status,
        statusLabel:
          "Đã thanh toán",
        title:
          "Thanh toán thành công",
        description:
          "YSim đã nhận được thanh toán và đang chuẩn bị eSIM cho bạn.",
        note:
          "Mã QR eSIM sẽ được gửi đến email người nhận sau khi hoàn tất chuẩn bị.",
        actions: [
          {
            label:
              "Xem đơn hàng",
            href:
              orderResultHref,
            variant:
              "primary",
          },
          {
            label:
              "Tiếp tục mua sắm",
            href:
              "/esim",
            variant:
              "secondary",
          },
        ],
      },
    };
  }

  if (
    status ===
    "failed"
  ) {
    return {
      result: {
        ...base,
        status,
        statusLabel:
          "Thanh toán thất bại",
        title:
          "Thanh toán chưa thành công",
        description:
          "Giao dịch chưa được xác nhận. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.",
        note:
          "Đơn hàng chưa được thực hiện và không có eSIM nào được gửi.",
        actions: [
          {
            label:
              "Thử thanh toán lại",
            href:
              "/checkout",
            variant:
              "primary",
          },
          {
            label:
              "Xem đơn hàng",
            href:
              orderResultHref,
            variant:
              "secondary",
          },
        ],
      },
    };
  }

  if (
    status ===
    "pending"
  ) {
    return {
      result: {
        ...base,
        status,
        statusLabel:
          "Chờ xác nhận",
        title:
          "Đang chờ xác nhận thanh toán",
        description:
          "YSim đã ghi nhận đơn hàng và đang kiểm tra giao dịch.",
        note:
          "Không cần thanh toán lại khi giao dịch đã được trừ tiền.",
        actions: [
          {
            label:
              "Xem đơn hàng",
            href:
              orderResultHref,
            variant:
              "primary",
          },
          {
            label:
              "Liên hệ hỗ trợ",
            href:
              "/support",
            variant:
              "secondary",
          },
        ],
      },
    };
  }

  return {
    result: {
      ...base,
      status,
      statusLabel:
        "Đang xử lý",
      title:
        "Đang xử lý thanh toán",
      description:
        "Vui lòng giữ trang này trong khi hệ thống chờ kết quả giao dịch.",
      note:
        "Không đóng ứng dụng ngân hàng hoặc thực hiện thanh toán lại.",
      actions: [
        {
          label:
            "Xem đơn hàng",
          href:
            orderResultHref,
          variant:
            "primary",
        },
        {
          label:
            "Quay lại Checkout",
          href:
            "/checkout",
          variant:
            "secondary",
        },
      ],
    },
  };
}

export function createOrderResultPreview(
  orderCode:
    string = paymentPreviewOrderCode,
  status:
    PaymentResultStatus =
      "success",
): OrderResultPageViewModel {
  const paymentResult =
    createPaymentResultPreview(
      status,
    ).result;

  return {
    orderCode,

    createdAtLabel:
      paymentResult
        .createdAtLabel,

    status:
      paymentResult.status,

    statusLabel:
      paymentResult
        .statusLabel,

    lines:
      checkoutPreviewPage
        .lines,

    totals:
      checkoutPreviewPage
        .totals,

    customer: {
      fullName:
        "Nguyễn Việt Khoa",
      email:
        paymentResult
          .customerEmail,
      phone:
        "+84 912 345 678",
    },

    recipient: {
      fullName:
        "Nguyễn Việt Khoa",
      email:
        paymentResult
          .recipientEmail,
    },

    payment: {
      methodId:
        paymentResult
          .paymentMethodId,
      methodLabel:
        paymentResult
          .paymentMethodLabel,
      status:
        paymentResult.status,
      statusLabel:
        paymentResult
          .statusLabel,
      providerReference:
        paymentResult
          .providerReference,
    },

    timeline:
      paymentResult
        .timeline,

    supportText:
      paymentResult
        .supportText,
  };
}
