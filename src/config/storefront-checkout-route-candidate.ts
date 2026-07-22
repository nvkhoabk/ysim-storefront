import type {
  CheckoutRouteCandidateViewModel,
} from "@/types/view-models/checkout-route-candidate";

export function createCheckoutRouteCandidateViewModel():
  CheckoutRouteCandidateViewModel {
  return {
    title:
      "Hoàn tất đơn hàng",
    description:
      "Nhập thông tin nhận eSIM, chọn phương thức thanh toán và tạo đơn hàng WooCommerce.",
    defaultCountry:
      process.env
        .YSIM_CHECKOUT_COUNTRY_DEFAULT
        ?.trim()
        .toUpperCase() ||
      "VN",
    handoffMode:
      process.env
        .YSIM_CHECKOUT_PAYMENT_HANDOFF
        ?.trim()
        .toLowerCase() ||
      "staged",
    diagnostics: [
      {
        domain:
          "cart",
        label:
          "Cart snapshot",
        status:
          "live",
        statusLabel:
          "Live",
        message:
          "Cart và totals được tải từ GET /api/checkout.",
      },
      {
        domain:
          "order",
        label:
          "WooCommerce Order",
        status:
          "live",
        statusLabel:
          "Live",
        message:
          "POST /api/checkout tạo order pending từ Cart server-side.",
      },
      {
        domain:
          "payment-selection",
        label:
          "Payment selection",
        status:
          "live",
        statusLabel:
          "Live",
        message:
          "GPay, OnePay và Cash được chọn từ registry hiện có.",
      },
      {
        domain:
          "payment-handoff",
        label:
          "Payment handoff",
        status:
          "ready",
        statusLabel:
          "Staged",
        message:
          "Order handoff được lưu trong sessionStorage cho Package 30.",
      },
      {
        domain:
          "idempotency",
        label:
          "Idempotency",
        status:
          "warning",
        statusLabel:
          "Client guard",
        message:
          "Client chặn double-click; server idempotency bền vững cần hoàn thiện trước production.",
      },
      {
        domain:
          "payment",
        label:
          "Payment API",
        status:
          "ready",
        statusLabel:
          "Not called",
        message:
          "Package 29 không gọi /api/payments/create.",
      },
    ],
  };
}
