import type {
  CartRouteCandidateViewModel,
} from "@/types/view-models/cart-route-candidate";

export function createCartRouteCandidateViewModel():
  CartRouteCandidateViewModel {
  return {
    title:
      "Giỏ hàng của bạn",
    description:
      "Kiểm tra gói eSIM, variation và tổng tiền trước khi chuyển sang Checkout.",
    checkoutCandidatePath:
      process.env
        .YSIM_CART_CHECKOUT_CANDIDATE_PATH
        ?.trim() ||
      "/ui-preview/checkout-refactor",
    diagnostics: [
      {
        domain:
          "cart-api",
        label:
          "WooCommerce Cart API",
        status:
          "live",
        statusLabel:
          "Live",
        message:
          "Load, add, update và remove dùng WooCommerce Store API qua Next.js proxy.",
      },
      {
        domain:
          "session",
        label:
          "Cart session",
        status:
          "ready",
        statusLabel:
          "Ready",
        message:
          "Cart-Token tiếp tục dùng cookie phía server hiện có.",
      },
      {
        domain:
          "product-bridge",
        label:
          "Product bridge",
        status:
          "live",
        statusLabel:
          "Live",
        message:
          "Package 26 v3 gửi variation ID và attribute pair thật.",
      },
      {
        domain:
          "coupon",
        label:
          "Coupon",
        status:
          "live",
        statusLabel:
          "Live",
        message:
          "Apply/remove coupon dùng WooCommerce Cart API.",
      },
      {
        domain:
          "checkout",
        label:
          "Checkout",
        status:
          "warning",
        statusLabel:
          "Candidate",
        message:
          "CTA hiện dẫn tới Checkout refactor preview; Package 29 sẽ nối order flow.",
      },
      {
        domain:
          "payment",
        label:
          "Payment",
        status:
          "ready",
        statusLabel:
          "Not called",
        message:
          "Package 28 không khởi tạo GPay, OnePay hoặc Payment Session.",
      },
    ],
  };
}
